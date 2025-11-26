"""Cluster detection algorithm for identifying coordinated abuse patterns."""

from typing import Dict, List, Optional, Set
from collections import defaultdict
from datetime import datetime, timedelta
import re


class ClusterDetector:
    """Detects clusters of related entities based on patterns."""
    
    def __init__(self):
        self.min_cluster_size = 2  # Minimum entities to form a cluster
        self.confidence_threshold = 0.5  # Minimum confidence to create cluster
    
    def detect_clusters(
        self, 
        phones: List[Dict],
        domains: List[Dict],
        wallets: List[Dict],
        handles: List[Dict],
        neo4j_client=None
    ) -> List[Dict]:
        """
        Detect clusters across all entity types.
        
        Args:
            phones: List of phone number dicts
            domains: List of domain dicts
            wallets: List of wallet dicts
            handles: List of messaging handle dicts
            neo4j_client: Optional Neo4j client for relationship analysis
        
        Returns:
            List of cluster dictionaries with entities and confidence scores
        """
        clusters = []
        
        # 1. VOIP provider clusters (phones using same VOIP provider)
        voip_clusters = self._detect_voip_clusters(phones)
        clusters.extend(voip_clusters)
        
        # 2. Phone number pattern clusters (similar number patterns)
        phone_pattern_clusters = self._detect_phone_pattern_clusters(phones)
        clusters.extend(phone_pattern_clusters)
        
        # 3. Wallet transaction clusters (wallets that transact together)
        wallet_clusters = self._detect_wallet_clusters(wallets, neo4j_client)
        clusters.extend(wallet_clusters)
        
        # 4. Domain clusters (same registrar, IP block, redirect chains)
        domain_clusters = self._detect_domain_clusters(domains)
        clusters.extend(domain_clusters)
        
        # 5. Cross-entity clusters (entities linked via relationships)
        cross_clusters = self._detect_cross_entity_clusters(
            phones, domains, wallets, handles, neo4j_client
        )
        clusters.extend(cross_clusters)
        
        # 6. Time-based clusters (entities seen within time window)
        time_clusters = self._detect_time_based_clusters(
            phones, domains, wallets, handles
        )
        clusters.extend(time_clusters)
        
        # Deduplicate and merge overlapping clusters
        merged_clusters = self._merge_overlapping_clusters(clusters)
        
        # Filter by confidence threshold
        filtered_clusters = [
            c for c in merged_clusters 
            if c.get("confidence", 0) >= self.confidence_threshold
        ]
        
        return filtered_clusters
    
    def _detect_voip_clusters(self, phones: List[Dict]) -> List[Dict]:
        """Detect clusters of phones using the same VOIP provider."""
        voip_groups = defaultdict(list)
        
        for phone in phones:
            voip_provider = phone.get("voip_provider")
            if voip_provider and phone.get("is_voip"):
                voip_groups[voip_provider].append({
                    "type": "phone",
                    "id": phone.get("phone"),
                    "data": phone
                })
        
        clusters = []
        for voip_provider, entities in voip_groups.items():
            if len(entities) >= self.min_cluster_size:
                # Calculate confidence based on cluster size
                confidence = min(len(entities) / 10.0, 1.0)  # Cap at 1.0
                
                clusters.append({
                    "cluster_id": f"voip_{voip_provider.replace(' ', '_').lower()}",
                    "description": f"Phones using VOIP provider: {voip_provider}",
                    "entities": entities,
                    "entity_types": ["phone"],
                    "confidence": confidence,
                    "pattern_type": "voip_provider",
                    "created_at": datetime.now().isoformat()
                })
        
        return clusters
    
    def _detect_phone_pattern_clusters(self, phones: List[Dict]) -> List[Dict]:
        """Detect clusters based on phone number patterns (same prefix, sequential, etc.)."""
        # Group by country code and similar prefix patterns
        pattern_groups = defaultdict(list)
        
        for phone in phones:
            phone_num = phone.get("phone", "").replace("+", "").replace("-", "").replace(" ", "")
            country_code = phone.get("country_code")
            
            if country_code and len(phone_num) > 3:
                # Extract first 3-6 digits as pattern key
                pattern_key = f"{country_code}_{phone_num[:min(6, len(phone_num)-4)]}"
                pattern_groups[pattern_key].append({
                    "type": "phone",
                    "id": phone.get("phone"),
                    "data": phone
                })
        
        clusters = []
        for pattern_key, entities in pattern_groups.items():
            if len(entities) >= self.min_cluster_size:
                # Sequential or similar numbers suggest coordinated activity
                confidence = min(len(entities) / 20.0, 0.8)  # Lower confidence for pattern-based
                
                clusters.append({
                    "cluster_id": f"pattern_{pattern_key}",
                    "description": f"Phones with similar number patterns ({len(entities)} entities)",
                    "entities": entities,
                    "entity_types": ["phone"],
                    "confidence": confidence,
                    "pattern_type": "phone_pattern",
                    "created_at": datetime.now().isoformat()
                })
        
        return clusters
    
    def _detect_wallet_clusters(self, wallets: List[Dict], neo4j_client=None) -> List[Dict]:
        """Detect clusters of wallets that transact together."""
        if not neo4j_client or not neo4j_client.driver:
            return []
        
        # Query Neo4j for wallet transaction relationships
        try:
            query = """
            MATCH (w1:Wallet)-[:TRANSACTED_WITH]->(w2:Wallet)
            RETURN w1.address as wallet1, w2.address as wallet2, count(*) as tx_count
            ORDER BY tx_count DESC
            """
            results = neo4j_client._execute_query(query)
            
            # Build transaction graph
            wallet_graph = defaultdict(set)
            for record in results:
                if hasattr(record, 'data'):
                    wallet1 = record['wallet1']
                    wallet2 = record['wallet2']
                    wallet_graph[wallet1].add(wallet2)
                    wallet_graph[wallet2].add(wallet1)
            
            # Find connected components (wallets that transact with each other)
            visited = set()
            clusters = []
            
            for wallet_address in wallet_graph:
                if wallet_address in visited:
                    continue
                
                # DFS to find connected component
                component = []
                stack = [wallet_address]
                
                while stack:
                    current = stack.pop()
                    if current in visited:
                        continue
                    visited.add(current)
                    component.append({
                        "type": "wallet",
                        "id": current,
                        "data": {"address": current}
                    })
                    
                    for neighbor in wallet_graph.get(current, []):
                        if neighbor not in visited:
                            stack.append(neighbor)
                
                if len(component) >= self.min_cluster_size:
                    confidence = min(len(component) / 15.0, 0.9)
                    
                    clusters.append({
                        "cluster_id": f"wallet_tx_{hash(str(component[:3]))}",
                        "description": f"Wallets with transaction relationships ({len(component)} entities)",
                        "entities": component,
                        "entity_types": ["wallet"],
                        "confidence": confidence,
                        "pattern_type": "wallet_transactions",
                        "created_at": datetime.now().isoformat()
                    })
            
        except Exception as e:
            print(f"⚠️  Error detecting wallet clusters: {e}")
        
        return clusters
    
    def _detect_domain_clusters(self, domains: List[Dict]) -> List[Dict]:
        """Detect clusters based on domain patterns (registrar, IP, redirect chains)."""
        # Group by registrar
        registrar_groups = defaultdict(list)
        
        for domain in domains:
            registrar = domain.get("registrar")
            if registrar:
                registrar_groups[registrar].append({
                    "type": "domain",
                    "id": domain.get("domain"),
                    "data": domain
                })
        
        clusters = []
        for registrar, entities in registrar_groups.items():
            if len(entities) >= self.min_cluster_size:
                confidence = min(len(entities) / 15.0, 0.85)
                
                clusters.append({
                    "cluster_id": f"registrar_{registrar.replace(' ', '_').lower()[:20]}",
                    "description": f"Domains registered through: {registrar}",
                    "entities": entities,
                    "entity_types": ["domain"],
                    "confidence": confidence,
                    "pattern_type": "registrar",
                    "created_at": datetime.now().isoformat()
                })
        
        # Group by IP address blocks
        ip_groups = defaultdict(list)
        for domain in domains:
            ip = domain.get("ip_address")
            if ip:
                # Extract IP block (first 3 octets)
                ip_parts = ip.split(".")
                if len(ip_parts) == 4:
                    ip_block = ".".join(ip_parts[:3])
                    ip_groups[ip_block].append({
                        "type": "domain",
                        "id": domain.get("domain"),
                        "data": domain
                    })
        
        for ip_block, entities in ip_groups.items():
            if len(entities) >= self.min_cluster_size:
                confidence = min(len(entities) / 12.0, 0.8)
                
                clusters.append({
                    "cluster_id": f"ip_block_{ip_block.replace('.', '_')}",
                    "description": f"Domains hosted on IP block: {ip_block}.x",
                    "entities": entities,
                    "entity_types": ["domain"],
                    "confidence": confidence,
                    "pattern_type": "ip_block",
                    "created_at": datetime.now().isoformat()
                })
        
        return clusters
    
    def _detect_cross_entity_clusters(
        self,
        phones: List[Dict],
        domains: List[Dict],
        wallets: List[Dict],
        handles: List[Dict],
        neo4j_client=None
    ) -> List[Dict]:
        """Detect clusters that span multiple entity types."""
        if not neo4j_client or not neo4j_client.driver:
            return []
        
        clusters = []
        
        try:
            # Find entities connected via multiple relationships
            # e.g., phone -> domain -> wallet
            query = """
            MATCH path = (p:PhoneNumber)-[*1..3]-(e)
            WHERE e:Domain OR e:Wallet OR e:MessagingHandle
            WITH p, collect(DISTINCT e) as connected
            WHERE size(connected) >= 2
            RETURN p.phone as phone, connected
            LIMIT 50
            """
            results = neo4j_client._execute_query(query)
            
            for record in results:
                if hasattr(record, 'data'):
                    phone = record.get('phone')
                    connected = record.get('connected', [])
                    
                    if len(connected) >= self.min_cluster_size:
                        entities = [{"type": "phone", "id": phone, "data": {}}]
                        
                        for entity in connected:
                            if hasattr(entity, 'labels'):
                                labels = list(entity.labels)
                                props = dict(entity)
                                
                                if "Domain" in labels:
                                    entities.append({
                                        "type": "domain",
                                        "id": props.get("domain"),
                                        "data": props
                                    })
                                elif "Wallet" in labels:
                                    entities.append({
                                        "type": "wallet",
                                        "id": props.get("address"),
                                        "data": props
                                    })
                                elif "MessagingHandle" in labels:
                                    entities.append({
                                        "type": "handle",
                                        "id": f"{props.get('handle')}|{props.get('platform')}",
                                        "data": props
                                    })
                        
                        if len(entities) >= self.min_cluster_size:
                            entity_types = list(set(e["type"] for e in entities))
                            confidence = min(len(entities) / 10.0, 0.9)
                            
                            clusters.append({
                                "cluster_id": f"cross_{hash(str(entities[:2]))}",
                                "description": f"Cross-entity cluster ({len(entities)} entities, types: {', '.join(entity_types)})",
                                "entities": entities,
                                "entity_types": entity_types,
                                "confidence": confidence,
                                "pattern_type": "cross_entity",
                                "created_at": datetime.now().isoformat()
                            })
        
        except Exception as e:
            print(f"⚠️  Error detecting cross-entity clusters: {e}")
        
        return clusters
    
    def _detect_time_based_clusters(
        self,
        phones: List[Dict],
        domains: List[Dict],
        wallets: List[Dict],
        handles: List[Dict]
    ) -> List[Dict]:
        """Detect clusters based on time proximity (entities seen within time window)."""
        time_window = timedelta(days=7)  # 7-day window
        
        # Combine all entities with timestamps
        all_entities = []
        for phone in phones:
            if phone.get("first_seen"):
                all_entities.append({
                    "type": "phone",
                    "id": phone.get("phone"),
                    "timestamp": self._parse_timestamp(phone.get("first_seen")),
                    "data": phone
                })
        
        for domain in domains:
            if domain.get("created_at"):
                all_entities.append({
                    "type": "domain",
                    "id": domain.get("domain"),
                    "timestamp": self._parse_timestamp(domain.get("created_at")),
                    "data": domain
                })
        
        for wallet in wallets:
            if wallet.get("first_seen"):
                all_entities.append({
                    "type": "wallet",
                    "id": wallet.get("address"),
                    "timestamp": self._parse_timestamp(wallet.get("first_seen")),
                    "data": wallet
                })
        
        # Sort by timestamp
        all_entities.sort(key=lambda x: x["timestamp"] if x["timestamp"] else datetime.min)
        
        # Find clusters within time window
        clusters = []
        current_cluster = []
        
        for entity in all_entities:
            if not entity["timestamp"]:
                continue
            
            if not current_cluster:
                current_cluster = [entity]
            else:
                # Check if entity is within time window of first entity in cluster
                first_time = current_cluster[0]["timestamp"]
                if entity["timestamp"] - first_time <= time_window:
                    current_cluster.append(entity)
                else:
                    # Save cluster if it meets minimum size
                    if len(current_cluster) >= self.min_cluster_size:
                        entity_types = list(set(e["type"] for e in current_cluster))
                        confidence = min(len(current_cluster) / 15.0, 0.7)
                        
                        clusters.append({
                            "cluster_id": f"time_{hash(str(current_cluster[:2]))}",
                            "description": f"Time-based cluster: {len(current_cluster)} entities seen within 7 days",
                            "entities": current_cluster,
                            "entity_types": entity_types,
                            "confidence": confidence,
                            "pattern_type": "time_based",
                            "created_at": datetime.now().isoformat()
                        })
                    current_cluster = [entity]
        
        # Save last cluster if it exists
        if len(current_cluster) >= self.min_cluster_size:
            entity_types = list(set(e["type"] for e in current_cluster))
            confidence = min(len(current_cluster) / 15.0, 0.7)
            
            clusters.append({
                "cluster_id": f"time_{hash(str(current_cluster[:2]))}",
                "description": f"Time-based cluster: {len(current_cluster)} entities seen within 7 days",
                "entities": current_cluster,
                "entity_types": entity_types,
                "confidence": confidence,
                "pattern_type": "time_based",
                "created_at": datetime.now().isoformat()
            })
        
        return clusters
    
    def _parse_timestamp(self, timestamp) -> Optional[datetime]:
        """Parse timestamp from various formats."""
        if isinstance(timestamp, datetime):
            return timestamp
        if isinstance(timestamp, str):
            try:
                # Try ISO format
                return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except:
                pass
        return None
    
    def _merge_overlapping_clusters(self, clusters: List[Dict]) -> List[Dict]:
        """Merge clusters that share significant overlap."""
        if not clusters:
            return []
        
        merged = []
        used = set()
        
        for i, cluster in enumerate(clusters):
            if i in used:
                continue
            
            cluster_entities = {f"{e['type']}:{e['id']}" for e in cluster.get("entities", [])}
            merged_cluster = cluster.copy()
            merged_indices = {i}
            
            # Find overlapping clusters
            for j, other_cluster in enumerate(clusters[i+1:], start=i+1):
                if j in used:
                    continue
                
                other_entities = {f"{e['type']}:{e['id']}" for e in other_cluster.get("entities", [])}
                
                # Calculate overlap
                overlap = len(cluster_entities & other_entities)
                union = len(cluster_entities | other_entities)
                
                if union > 0:
                    overlap_ratio = overlap / union
                    
                    # Merge if significant overlap (>30%)
                    if overlap_ratio > 0.3:
                        merged_cluster["entities"].extend(other_cluster.get("entities", []))
                        merged_cluster["entity_types"] = list(set(
                            merged_cluster.get("entity_types", []) + 
                            other_cluster.get("entity_types", [])
                        ))
                        merged_cluster["confidence"] = max(
                            merged_cluster.get("confidence", 0),
                            other_cluster.get("confidence", 0)
                        )
                        merged_cluster["description"] += f" + {other_cluster.get('description', '')}"
                        merged_indices.add(j)
            
            # Deduplicate entities
            seen = set()
            unique_entities = []
            for entity in merged_cluster["entities"]:
                entity_key = f"{entity['type']}:{entity['id']}"
                if entity_key not in seen:
                    seen.add(entity_key)
                    unique_entities.append(entity)
            
            merged_cluster["entities"] = unique_entities
            
            # Mark as used
            used.update(merged_indices)
            merged.append(merged_cluster)
        
        return merged


def detect_clusters(postgres_client=None, neo4j_client=None) -> List[Dict]:
    """
    Convenience function to detect clusters from database.
    
    Args:
        postgres_client: PostgreSQL client to fetch entities
        neo4j_client: Neo4j client for relationship analysis
    
    Returns:
        List of detected clusters
    """
    if not postgres_client or not postgres_client.conn:
        print("⚠️  PostgreSQL not available for cluster detection")
        return []
    
    try:
        phones = postgres_client.get_all_phones()
        domains = postgres_client.get_all_domains()
        wallets = postgres_client.get_all_wallets()
        handles = []  # TODO: Add get_all_handles() method
        
        detector = ClusterDetector()
        clusters = detector.detect_clusters(phones, domains, wallets, handles, neo4j_client)
        
        return clusters
    except Exception as e:
        print(f"⚠️  Error in cluster detection: {e}")
        import traceback
        traceback.print_exc()
        return []

