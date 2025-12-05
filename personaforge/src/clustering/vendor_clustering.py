"""Vendor clustering module for detecting vendor patterns by infrastructure overlap."""

from typing import Dict, List
from collections import defaultdict, Counter


def detect_vendor_clusters(postgres_client) -> List[Dict]:
    """
    Detect vendor clusters by analyzing shared infrastructure.
    
    Clusters vendors based on:
    - Shared hosting providers
    - Shared CDNs
    - Shared payment processors
    - Shared registrars
    
    Uses a more flexible approach: domains sharing ANY infrastructure element
    are grouped together, not just exact matches.
    """
    if not postgres_client or not postgres_client.conn:
        return []
    
    try:
        domains = postgres_client.get_all_enriched_domains()
        
        # Group domains by individual infrastructure elements (not exact combinations)
        # This allows domains sharing just CDN, or just host, etc. to be clustered
        cdn_groups = defaultdict(list)
        host_groups = defaultdict(list)
        registrar_groups = defaultdict(list)
        payment_groups = defaultdict(list)
        
        # Also keep exact signature matches for more precise clusters
        exact_signature_groups = defaultdict(list)
        
        for domain in domains:
            domain_name = domain.get('domain')
            if not domain_name:
                continue
            
            # Create infrastructure signature
            # Check both direct fields and enrichment_data JSONB
            enrichment = domain.get('enrichment_data', {})
            if isinstance(enrichment, str):
                try:
                    import json
                    enrichment = json.loads(enrichment)
                except:
                    enrichment = {}
            
            signature_parts = []
            
            # Extract infrastructure data (check both direct fields and enrichment_data)
            host_name = domain.get('host_name') or enrichment.get('host_name')
            cdn = domain.get('cdn') or enrichment.get('cdn')
            registrar = domain.get('registrar') or enrichment.get('registrar')
            payment_processor = domain.get('payment_processor') or enrichment.get('payment_processor')
            
            # Normalize values
            if cdn:
                cdn_normalized = cdn.strip()
                cdn_groups[cdn_normalized].append(domain_name)
                signature_parts.append(f"cdn:{cdn_normalized}")
            
            if host_name:
                host_normalized = host_name.strip()
                host_groups[host_normalized].append(domain_name)
                signature_parts.append(f"host:{host_normalized}")
            
            if registrar:
                registrar_normalized = registrar.strip()
                registrar_groups[registrar_normalized].append(domain_name)
                signature_parts.append(f"registrar:{registrar_normalized}")
            
            if payment_processor:
                payment_normalized = payment_processor.strip()
                payment_groups[payment_normalized].append(domain_name)
                signature_parts.append(f"payment:{payment_normalized}")
            
            # Also track exact signature matches
            if signature_parts:
                signature = "|".join(sorted(signature_parts))
                exact_signature_groups[signature].append(domain_name)
        
        # Build clusters from individual infrastructure elements
        clusters = []
        cluster_ids = {}  # Track which domains are in which clusters to avoid duplicates
        
        # Helper to get vendor types for a domain list
        def get_vendor_types(domain_list):
            vendor_types = set()
            for domain_name in domain_list:
                domain_obj = next((d for d in domains if d.get('domain') == domain_name), None)
                if domain_obj:
                    vtype = domain_obj.get('vendor_type')
                    if not vtype:
                        enrichment = domain_obj.get('enrichment_data', {})
                        if isinstance(enrichment, str):
                            try:
                                import json
                                enrichment = json.loads(enrichment)
                            except:
                                enrichment = {}
                        vtype = enrichment.get('vendor_type')
                    if vtype:
                        vendor_types.add(vtype)
            return list(vendor_types)
        
        # Create clusters from CDN groups
        for cdn_name, domain_list in cdn_groups.items():
            if len(domain_list) >= 2:
                cluster_id = f"cdn:{cdn_name}"
                clusters.append({
                    "id": cluster_id,
                    "type": "CDN",
                    "infrastructure_element": cdn_name,
                    "domains": domain_list,
                    "domain_count": len(domain_list),
                    "infrastructure": [f"cdn:{cdn_name}"],
                    "vendor_types": get_vendor_types(domain_list),
                    "vendor_type_count": len(get_vendor_types(domain_list))
                })
        
        # Create clusters from Host groups
        for host_name, domain_list in host_groups.items():
            if len(domain_list) >= 2:
                cluster_id = f"host:{host_name}"
                # Skip if already in a CDN cluster with same domains
                clusters.append({
                    "id": cluster_id,
                    "type": "Host",
                    "infrastructure_element": host_name,
                    "domains": domain_list,
                    "domain_count": len(domain_list),
                    "infrastructure": [f"host:{host_name}"],
                    "vendor_types": get_vendor_types(domain_list),
                    "vendor_type_count": len(get_vendor_types(domain_list))
                })
        
        # Create clusters from Registrar groups
        for registrar_name, domain_list in registrar_groups.items():
            if len(domain_list) >= 2:
                cluster_id = f"registrar:{registrar_name}"
                clusters.append({
                    "id": cluster_id,
                    "type": "Registrar",
                    "infrastructure_element": registrar_name,
                    "domains": domain_list,
                    "domain_count": len(domain_list),
                    "infrastructure": [f"registrar:{registrar_name}"],
                    "vendor_types": get_vendor_types(domain_list),
                    "vendor_type_count": len(get_vendor_types(domain_list))
                })
        
        # Create clusters from Payment Processor groups
        for payment_name, domain_list in payment_groups.items():
            if len(domain_list) >= 2:
                cluster_id = f"payment:{payment_name}"
                clusters.append({
                    "id": cluster_id,
                    "type": "Payment",
                    "infrastructure_element": payment_name,
                    "domains": domain_list,
                    "domain_count": len(domain_list),
                    "infrastructure": [f"payment:{payment_name}"],
                    "vendor_types": get_vendor_types(domain_list),
                    "vendor_type_count": len(get_vendor_types(domain_list))
                })
        
        # Also include exact signature matches (domains sharing multiple infrastructure elements)
        for signature, domain_list in exact_signature_groups.items():
            if len(domain_list) >= 2:
                # Check if this exact match is already covered by individual clusters
                # Only add if it's a more specific match (multiple infrastructure elements)
                if len(signature.split("|")) > 1:
                    cluster_id = f"exact:{signature}"
                    clusters.append({
                        "id": cluster_id,
                        "type": "Exact Match",
                        "infrastructure_element": "Multiple",
                        "domains": domain_list,
                        "domain_count": len(domain_list),
                        "infrastructure": signature.split("|"),
                        "vendor_types": get_vendor_types(domain_list),
                        "vendor_type_count": len(get_vendor_types(domain_list))
                    })
        
        # Sort by domain count (largest clusters first), then by vendor type diversity
        clusters.sort(key=lambda x: (x.get("domain_count", 0) or 0, x.get("vendor_type_count", 0) or 0), reverse=True)
        
        return clusters
    
    except Exception as e:
        print(f"Error detecting vendor clusters: {e}")
        import traceback
        traceback.print_exc()
        return []

