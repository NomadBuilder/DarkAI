// Vendors page JavaScript

let vendors = [];
let clusters = [];
let contentClusters = [];
let currentClusterType = 'infrastructure'; // 'infrastructure' or 'content'

// Load vendors data
async function loadVendors() {
  try {
    const minDomains = document.getElementById('min-domains')?.value || 1;
    const response = await fetch(`/api/vendors?min_domains=${minDomains}`);
    const data = await response.json();
    
    if (data.vendors) {
      vendors = data.vendors;
      renderVendors();
      updateStats();
    }
  } catch (error) {
    console.error('Error loading vendors:', error);
    document.getElementById('vendors-container').innerHTML = 
      '<div class="loading">Error loading vendors. Please try again.</div>';
  }
}

// Load clusters data
async function loadClusters() {
  try {
    const minDomains = parseInt(document.getElementById('min-domains')?.value || 2);
    
    // Load both clusters and homepage stats for consistency
    const [clustersResponse, statsResponse] = await Promise.all([
      fetch('/personaforge/api/clusters'),
      fetch('/personaforge/api/homepage-stats')
    ]);
    
    const clustersData = await clustersResponse.json();
    const statsData = await statsResponse.json();
    
    // Check for database unavailable errors
    if (clustersData.message && clustersData.message.includes("PostgreSQL not available")) {
      const container = document.getElementById('clusters-container');
      container.innerHTML = `
        <div style="padding: 2rem; background: rgba(255, 68, 68, 0.1); border: 2px solid #ff4444; border-radius: 8px; color: #ff4444;">
          <h3 style="margin-bottom: 1rem;">❌ Database Connection Required</h3>
          <p style="margin-bottom: 1rem; color: #ccc;">PostgreSQL database is not available. This is required for PersonaForge to function.</p>
          <p style="color: #999; font-size: 0.9rem;">
            <strong>Local Development:</strong> Make sure PostgreSQL is running and accessible.<br>
            <strong>Deployment:</strong> Configure POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB environment variables.
          </p>
        </div>
      `;
      // Update stats to show error state
      document.getElementById('total-domains').textContent = '—';
      document.getElementById('total-vendors').textContent = '—';
      document.getElementById('total-high-risk').textContent = '—';
      document.getElementById('total-clusters').textContent = '—';
      return;
    }
    
    if (clustersData.clusters) {
      // Filter clusters by min domains
      clusters = clustersData.clusters.filter(c => (c.domain_count || 0) >= minDomains);
      console.log('Loaded clusters:', clustersData.clusters.length, 'Filtered clusters:', clusters.length, 'Min domains:', minDomains);
      renderClusters();
    } else if (clustersData.error) {
      console.error('Clusters API error:', clustersData.error);
      document.getElementById('clusters-container').innerHTML = 
        `<div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; padding: 2rem; text-align: center;">
          <p style="color: #ff4444; margin-bottom: 1rem;">Error loading clusters: ${clustersData.error}</p>
        </div>`;
    } else {
      console.warn('No clusters data in response:', clustersData);
      clusters = [];
      renderClusters();
    }
    
    // Update stats from homepage-stats API for consistency
    if (statsData) {
      updateStatsFromHomepage(statsData);
    } else {
      updateStats();
    }
  } catch (error) {
    console.error('Error loading clusters:', error);
    document.getElementById('clusters-container').innerHTML = 
      '<div class="loading" style="color: #ff4444;">Error loading clusters. Please try again.</div>';
    updateStats(); // Fallback to cluster-based stats
  }
}

// Update stats from homepage-stats API (for consistency)
function updateStatsFromHomepage(data) {
  document.getElementById('total-domains').textContent = data.total_domains || 0;
  
  // Use top_vendors count if vendors table is empty
  let vendorCount = data.total_vendors || 0;
  if (vendorCount === 0 && data.top_vendors && data.top_vendors.length > 0) {
    vendorCount = data.top_vendors.length;
  }
  document.getElementById('total-vendors').textContent = vendorCount;
  
  document.getElementById('total-high-risk').textContent = data.high_risk_domains || 0;
  // Use infrastructure_clusters from API, or fallback to filtered clusters count
  const clusterCount = data.infrastructure_clusters || clusters.length || 0;
  document.getElementById('total-clusters').textContent = clusterCount;
}

// Removed deprecated renderVendors() function - now using clusters only

// Render clusters
function renderClusters() {
  const container = document.getElementById('clusters-container');
  
  if (clusters.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; padding: 2rem; text-align: center;">
        <p style="color: #999; margin-bottom: 1rem;">No clusters found matching the current filter.</p>
        <p style="color: #666; font-size: 0.9rem;">
          Try lowering the "Min Domains" filter, or visit the <a href="/dashboard" style="color: #ff4444;">Dashboard</a> to see the network graph.
        </p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = clusters.map(cluster => {
    // Format infrastructure signature nicely
    const infrastructure = cluster.infrastructure || [];
    const clusterType = cluster.type || 'Infrastructure';
    const infraDisplay = infrastructure.map(infra => {
      const [type, value] = infra.split(':');
      const typeColors = {
        'cdn': '#4ecdc4',
        'host': '#95e1d3',
        'registrar': '#f38181',
        'payment': '#aa96da'
      };
      const color = typeColors[type.toLowerCase()] || '#ff4444';
      return `<span style="display: inline-block; margin: 0.25rem 0.5rem 0.25rem 0; padding: 0.25rem 0.75rem; background: ${color}20; border: 1px solid ${color}40; border-radius: 4px; font-size: 0.85rem;">
        <strong style="color: ${color}; text-transform: uppercase;">${type}:</strong> ${value}
      </span>`;
    }).join('');
    
    // Cluster type badge
    const typeBadgeColors = {
      'CDN': '#4ecdc4',
      'Host': '#95e1d3',
      'Registrar': '#f38181',
      'Payment': '#aa96da',
      'Exact Match': '#ff6b6b'
    };
    const badgeColor = typeBadgeColors[clusterType] || '#ff4444';
    
    return `
      <div class="cluster-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; transition: all 0.3s;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; color: #fff; font-size: 1.1rem;">Cluster (${cluster.domain_count || 0} domains)</h3>
              <span style="background: ${badgeColor}20; color: ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; border: 1px solid ${badgeColor}40;">
                ${clusterType}
              </span>
            </div>
            <p style="color: #999; font-size: 0.85rem; margin: 0;">Shared infrastructure grouping</p>
          </div>
          <div style="background: rgba(255, 68, 68, 0.2); color: #ff4444; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
            ${cluster.domain_count || 0} domains
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Shared Infrastructure</p>
          <div style="margin-bottom: 1rem;">
            ${infraDisplay || '<span style="color: #666;">No infrastructure data</span>'}
          </div>
        </div>
        
        <div>
          <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Domains in Cluster</p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${(cluster.domains || []).map(domain => `
              <a href="/personaforge/domains/${encodeURIComponent(domain)}" style="display: inline-block; padding: 0.4rem 0.8rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; font-size: 0.9rem; color: #fff; font-family: monospace; transition: all 0.2s; cursor: pointer; text-decoration: none;" onmouseover="this.style.background='rgba(255,68,68,0.1)'; this.style.borderColor='rgba(255,68,68,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'" title="View detailed analysis">
                ${domain}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update statistics
function updateStats() {
  // Count unique vendor types from clusters
  const vendorTypes = new Set();
  clusters.forEach(cluster => {
    if (cluster.vendor_types && Array.isArray(cluster.vendor_types)) {
      cluster.vendor_types.forEach(vt => vendorTypes.add(vt));
    }
  });
  
  document.getElementById('total-vendors').textContent = vendorTypes.size;
  document.getElementById('total-clusters').textContent = clusters.length;
  
  // Calculate total unique domains from clusters
  const allDomains = new Set();
  clusters.forEach(cluster => {
    if (cluster.domains && Array.isArray(cluster.domains)) {
      cluster.domains.forEach(domain => allDomains.add(domain));
    }
  });
  document.getElementById('total-domains').textContent = allDomains.size;
}

// Load content-based clusters
async function loadContentClusters() {
  try {
    const similarityThreshold = parseFloat(document.getElementById('similarity-threshold')?.value || 0.6);
    const minClusterSize = parseInt(document.getElementById('min-cluster-size')?.value || 2);
    
    const response = await fetch(`/personaforge/api/content-clusters?similarity_threshold=${similarityThreshold}&min_cluster_size=${minClusterSize}&include_duplicates=true`);
    const data = await response.json();
    
    if (data.clusters) {
      contentClusters = data.clusters;
      renderContentClusters();
    } else if (data.error) {
      console.error('Content clusters API error:', data.error);
      document.getElementById('clusters-container').innerHTML = 
        `<div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; padding: 2rem; text-align: center;">
          <p style="color: #ff4444; margin-bottom: 1rem;">Error loading content clusters: ${data.error}</p>
        </div>`;
    } else {
      contentClusters = [];
      renderContentClusters();
    }
  } catch (error) {
    console.error('Error loading content clusters:', error);
    document.getElementById('clusters-container').innerHTML = 
      '<div class="loading" style="color: #ff4444;">Error loading content clusters. Please try again.</div>';
  }
}

// Render content-based clusters
function renderContentClusters() {
  const container = document.getElementById('clusters-container');
  
  if (contentClusters.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; padding: 2rem; text-align: center;">
        <p style="color: #999; margin-bottom: 1rem;">No content similarity clusters found.</p>
        <p style="color: #666; font-size: 0.9rem;">
          Try lowering the similarity threshold or minimum cluster size.
        </p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = contentClusters.map(cluster => {
    const clusterType = cluster.type || 'Content Similarity';
    const badgeColor = clusterType === 'Exact Duplicate' ? '#ff6b6b' : '#4ecdc4';
    
    // Format vendors list
    const vendorsList = (cluster.vendors || []).map(v => {
      const vendorName = v.vendor_name || v.title || 'Unknown';
      const vendorId = v.id;
      return `<a href="/personaforge/vendor-intel/${vendorId}" style="color: #ff4444; text-decoration: none; font-weight: 500;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${vendorName}</a>`;
    }).join(', ');
    
    // Format common keywords
    const keywordsDisplay = (cluster.common_keywords || []).map(k => 
      `<span style="display: inline-block; margin: 0.25rem 0.5rem 0.25rem 0; padding: 0.25rem 0.75rem; background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 4px; font-size: 0.85rem; color: #ff6b6b;">${k}</span>`
    ).join('');
    
    return `
      <div class="cluster-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; transition: all 0.3s;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; color: #fff; font-size: 1.1rem;">${clusterType} Cluster (${cluster.vendor_count || 0} vendors)</h3>
              <span style="background: ${badgeColor}20; color: ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; border: 1px solid ${badgeColor}40;">
                ${clusterType}
              </span>
            </div>
            <p style="color: #999; font-size: 0.85rem; margin: 0;">
              Average similarity: <strong style="color: #fff;">${(cluster.average_similarity * 100).toFixed(1)}%</strong>
            </p>
          </div>
          <div style="background: rgba(255, 68, 68, 0.2); color: #ff4444; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
            ${cluster.vendor_count || 0} vendors
          </div>
        </div>
        
        ${cluster.sample_text ? `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 4px; border-left: 3px solid ${badgeColor};">
          <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Sample Description</p>
          <p style="color: #ccc; font-size: 0.9rem; line-height: 1.6; margin: 0;">${cluster.sample_text}</p>
        </div>
        ` : ''}
        
        ${keywordsDisplay ? `
        <div style="margin-bottom: 1rem;">
          <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Common Keywords</p>
          <div style="margin-bottom: 1rem;">
            ${keywordsDisplay}
          </div>
        </div>
        ` : ''}
        
        <div>
          <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Vendors in Cluster</p>
          <div style="color: #fff; line-height: 1.8;">
            ${vendorsList || '<span style="color: #666;">No vendors</span>'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load infrastructure clusters by default
  loadClusters();
  currentClusterType = 'infrastructure';
  
  // Toggle buttons
  document.getElementById('show-infrastructure-clusters')?.addEventListener('click', () => {
    currentClusterType = 'infrastructure';
    document.getElementById('show-infrastructure-clusters').classList.add('btn-primary');
    document.getElementById('show-infrastructure-clusters').classList.remove('btn-secondary');
    document.getElementById('show-content-clusters').classList.add('btn-secondary');
    document.getElementById('show-content-clusters').classList.remove('btn-primary');
    // Show/hide filters
    document.getElementById('infrastructure-filters').style.display = 'flex';
    document.getElementById('content-filters').style.display = 'none';
    loadClusters();
  });
  
  document.getElementById('show-content-clusters')?.addEventListener('click', () => {
    currentClusterType = 'content';
    document.getElementById('show-content-clusters').classList.add('btn-primary');
    document.getElementById('show-content-clusters').classList.remove('btn-secondary');
    document.getElementById('show-infrastructure-clusters').classList.add('btn-secondary');
    document.getElementById('show-infrastructure-clusters').classList.remove('btn-primary');
    // Show/hide filters
    document.getElementById('infrastructure-filters').style.display = 'none';
    document.getElementById('content-filters').style.display = 'flex';
    loadContentClusters();
  });
  
  // Content cluster filters
  document.getElementById('similarity-threshold')?.addEventListener('change', () => {
    if (currentClusterType === 'content') {
      loadContentClusters();
    }
  });
  
  document.getElementById('min-cluster-size')?.addEventListener('change', () => {
    if (currentClusterType === 'content') {
      loadContentClusters();
    }
  });
  
  // Refresh button
  document.getElementById('refresh-vendors')?.addEventListener('click', () => {
    if (currentClusterType === 'infrastructure') {
      loadClusters();
    } else {
      loadContentClusters();
    }
  });
  
  // Min domains filter - update clusters when changed (only for infrastructure)
  document.getElementById('min-domains')?.addEventListener('change', () => {
    if (currentClusterType === 'infrastructure') {
      loadClusters();
    }
  });
  
  // Also trigger on input for real-time filtering
  document.getElementById('min-domains')?.addEventListener('input', () => {
    if (currentClusterType === 'infrastructure') {
      loadClusters();
    }
  });
});

