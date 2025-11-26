// Enhanced visualization with graph and table views

let graphData = { nodes: [], edges: [] };
let originalGraphData = { nodes: [], edges: [] }; // Store original unfiltered data
let domainsData = [];
let filteredDomains = [];
let simulation;
let svg, g;
let currentSort = { column: null, direction: 'asc' };

// Column visibility configuration
const defaultVisibleColumns = ['domain', 'isp', 'host_name', 'cms', 'cdn', 'registrar', 'creation_date'];
let visibleColumns = loadColumnPreferences();

// Column definitions
const columnDefinitions = {
    'domain': 'Domain',
    'isp': 'ISP',
    'host_name': 'Host',
    'cms': 'CMS',
    'cdn': 'CDN',
    'registrar': 'Registrar',
    'creation_date': 'Created',
    'frameworks': 'Frameworks',
    'ip_address': 'IP Address',
    'asn': 'ASN',
    'web_server': 'Web Server',
    'payment_processor': 'Payment',
    'expiration_date': 'Expires',
    'analytics': 'Analytics',
    'languages': 'Languages',
    'ip_addresses': 'IPs (IPv4)',
    'ipv6_addresses': 'IPv6',
    'name_servers': 'Name Servers',
    'mx_records': 'MX Records'
};

function loadColumnPreferences() {
    try {
        const saved = localStorage.getItem('tableColumns');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading column preferences:', e);
    }
    return [...defaultVisibleColumns];
}

function saveColumnPreferences() {
    try {
        localStorage.setItem('tableColumns', JSON.stringify(visibleColumns));
    } catch (e) {
        console.error('Error saving column preferences:', e);
    }
}

// Initialize visualization
function initVisualization() {
    // Restore last view from localStorage
    const lastView = localStorage.getItem('lastView') || 'graph';
    
    // View toggle handlers
    document.getElementById("graph-view-btn").addEventListener("click", () => {
        switchView("graph");
        localStorage.setItem('lastView', 'graph');
    });
    document.getElementById("table-view-btn").addEventListener("click", () => {
        switchView("table");
        localStorage.setItem('lastView', 'table');
    });
    document.getElementById("analysis-view-btn").addEventListener("click", () => {
        switchView("analysis");
        localStorage.setItem('lastView', 'analysis');
    });
    document.getElementById("about-view-btn").addEventListener("click", () => {
        switchView("about");
        localStorage.setItem('lastView', 'about');
    });
    
    // Don't call switchView here - it will be called after data loads in refreshAll
    
    // Table search handler
    document.getElementById("table-search").addEventListener("input", filterTable);
    document.getElementById("filter-column").addEventListener("change", filterTable);
    
    // Graph search handler
    document.getElementById("graph-search").addEventListener("input", filterGraph);
    
    // Graph type filter handlers (domains are always shown, no filter needed)
    document.getElementById("filter-host").addEventListener("change", filterGraph);
    document.getElementById("filter-cdn").addEventListener("change", filterGraph);
    document.getElementById("filter-cms").addEventListener("change", filterGraph);
    document.getElementById("filter-registrar").addEventListener("change", filterGraph);
    
    // Column visibility controls
    document.getElementById("show-all-btn").addEventListener("click", showAllColumns);
    document.getElementById("column-toggle-btn").addEventListener("click", toggleColumnMenu);
    document.getElementById("save-columns-btn").addEventListener("click", saveColumnSettings);
    document.getElementById("reset-columns-btn").addEventListener("click", resetColumnSettings);
    
    // Close column menu when clicking outside
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("column-menu");
        const btn = document.getElementById("column-toggle-btn");
        if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
            menu.style.display = "none";
        }
    });
    
    // Table sort handlers
    document.querySelectorAll(".sortable").forEach(th => {
        th.addEventListener("click", () => sortTable(th.dataset.column));
    });
    
    // Initialize column visibility
    initializeColumnVisibility();
    
    // Modal close handler
    document.querySelector(".modal-close").addEventListener("click", closeModal);
    document.getElementById("node-modal").addEventListener("click", (e) => {
        if (e.target.id === "node-modal") {
            closeModal();
        }
    });
    
    // Button handlers
    document.getElementById("refresh-btn").addEventListener("click", () => {
        refreshAll._skipViewRestore = true;
        refreshAll().then(() => {
            refreshAll._skipViewRestore = false;
        });
    });
    document.getElementById("reset-zoom-btn").addEventListener("click", resetZoom);
    document.getElementById("export-btn").addEventListener("click", exportData);
    
    // Initialize graph view
    initGraphView();
    
    // Load all data (view will be restored after data loads)
    refreshAll();
}

// Switch between graph, table, list, and analysis views
function switchView(view) {
    const graphView = document.getElementById("graph-view");
    const tableView = document.getElementById("table-view");
    const analysisView = document.getElementById("analysis-view");
    const aboutView = document.getElementById("about-view");
    const graphBtn = document.getElementById("graph-view-btn");
    const tableBtn = document.getElementById("table-view-btn");
    const analysisBtn = document.getElementById("analysis-view-btn");
    const aboutBtn = document.getElementById("about-view-btn");
    const resetZoomBtn = document.getElementById("reset-zoom-btn");
    
    // Hide all views
    graphView.style.display = "none";
    tableView.style.display = "none";
    analysisView.style.display = "none";
    aboutView.style.display = "none";
    
    // Remove active class from all buttons
    graphBtn.classList.remove("active");
    tableBtn.classList.remove("active");
    analysisBtn.classList.remove("active");
    aboutBtn.classList.remove("active");
    
    if (view === "graph") {
        graphView.style.display = "block";
        graphBtn.classList.add("active");
        resetZoomBtn.style.display = "inline-block";
        if (graphData.nodes.length === 0) {
            loadGraph();
        }
    } else if (view === "table") {
        tableView.style.display = "block";
        tableBtn.classList.add("active");
        resetZoomBtn.style.display = "none";
        if (domainsData.length === 0) {
            loadDomains();
        }
    } else if (view === "analysis") {
        analysisView.style.display = "block";
        analysisBtn.classList.add("active");
        resetZoomBtn.style.display = "none";
        // Analysis content is now static HTML - no API call needed
    } else if (view === "about") {
        aboutView.style.display = "block";
        aboutBtn.classList.add("active");
        resetZoomBtn.style.display = "none";
    }
}

// Initialize graph view
function initGraphView() {
    svg = d3.select("#graph-svg");
    
    // Get container dimensions
    const container = document.querySelector(".graph-container");
    const width = container ? container.clientWidth - 40 : 1200;
    const height = 600;
    
    svg.attr("width", width).attr("height", height);
    
    // Clear any existing content
    svg.selectAll("*").remove();
    
    g = svg.append("g");
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
}

// Reset zoom
function resetZoom() {
    const zoom = d3.zoom();
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
    );
}

// Refresh all data
async function refreshAll() {
    await Promise.all([
        loadGraph(),
        loadStats(),
        loadAnalytics(),
        loadDomains()
        // Don't load analysis here - only load when analysis tab is active
    ]);
    
    // Only restore view if we're initializing (not when user clicks refresh)
    if (!refreshAll._skipViewRestore) {
        let lastView = localStorage.getItem('lastView') || 'graph';
        // If saved view was 'list', default to 'graph' since list view was removed
        if (lastView === 'list') {
            lastView = 'graph';
            localStorage.setItem('lastView', 'graph');
        }
        switchView(lastView);
    }
}

// Load graph data from API
async function loadGraph() {
    try {
        const response = await fetch("/shadowstack/api/graph");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Convert edge IDs to node objects for D3 compatibility
        const nodeMap = new Map(data.nodes.map(n => [String(n.id), n]));
        const edgesWithNodes = data.edges.map(edge => {
            const sourceId = String(edge.source);
            const targetId = String(edge.target);
            const sourceNode = nodeMap.get(sourceId);
            const targetNode = nodeMap.get(targetId);
            
            if (sourceNode && targetNode) {
                return {
                    ...edge,
                    source: sourceNode,
                    target: targetNode
                };
            }
            return null;
        }).filter(e => e !== null);
        
        // Store original with converted edges (node objects, not IDs)
        originalGraphData = {
            nodes: [...data.nodes],
            edges: edgesWithNodes.map(e => ({ ...e })) // Deep copy with node references
        };
        
        // Initialize graphData with all nodes visible
        graphData = {
            nodes: [...data.nodes],
            edges: edgesWithNodes
        };
        
        console.log("Graph data loaded:", graphData.nodes?.length, "nodes", graphData.edges?.length, "edges");
        filterGraph(); // Apply any existing filter
    } catch (error) {
        console.error("Error loading graph:", error);
        // Show error in graph area
        if (g) {
            g.selectAll("*").remove();
            g.append("text")
                .attr("x", 300)
                .attr("y", 300)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#dc3545")
                .text(`Error loading graph: ${error.message}`);
        }
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch("/shadowstack/api/stats");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
        }
        const stats = await response.json();
        
        // Check if response contains an error
        if (stats.error) {
            const statsElement = document.getElementById("stats");
            if (statsElement) {
                statsElement.innerHTML = `<span style="color: #d9353e;">Database connection failed: ${stats.message || stats.error}</span>`;
            }
            return;
        }
        
        const statsHtml = `
            <strong>Nodes:</strong> ${stats.total_nodes || 0} | 
            <strong>Edges:</strong> ${stats.total_edges || 0} |
            ${Object.entries(stats.node_types || {}).map(([type, count]) => 
                `<strong>${type}:</strong> ${count}`
            ).join(" | ")}
        `;
        
        const statsElement = document.getElementById("stats");
        if (statsElement) {
            statsElement.innerHTML = statsHtml;
        }
    } catch (error) {
        console.error("Error loading stats:", error);
        const statsElement = document.getElementById("stats");
        if (statsElement) {
            statsElement.innerHTML = `<span style="color: #d9353e;">Error loading statistics: ${error.message}</span>`;
        }
    }
}

// Load analytics and outliers
async function loadAnalytics() {
    try {
        const response = await fetch("/shadowstack/api/analytics");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
        }
        const analytics = await response.json();
        
        // Check if response contains an error
        if (analytics.error) {
            const container = document.getElementById("summary-content");
            if (container) {
                const errorMsg = analytics.message || analytics.error;
                const isRenderDB = errorMsg.includes('render.com') || errorMsg.includes('timeout');
                container.innerHTML = `
                    <div style="padding: 2rem; background: rgba(217, 53, 62, 0.1); border-left: 4px solid #d9353e; border-radius: 8px;">
                        <h3 style="color: #d9353e; margin-bottom: 0.5rem;">⚠️ Unable to connect to database</h3>
                        ${isRenderDB ? `
                        <p style="color: #9ca3af; margin-bottom: 0.5rem;">
                            <strong>Local Development Mode:</strong> The dashboard is trying to connect to a Render PostgreSQL database, 
                            which is not accessible from localhost. This is expected when running locally.
                        </p>
                        <p style="color: #9ca3af; font-size: 0.9rem;">
                            <strong>To view data:</strong> Deploy the app to Render, or configure a local PostgreSQL database in your .env file.
                        </p>
                        ` : `
                        <p style="color: #9ca3af;">Error: ${errorMsg}</p>
                        <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.5rem;">Please check your database configuration.</p>
                        `}
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 6px;">
                            <p style="color: #60a5fa; font-size: 0.9rem; margin: 0;">
                                <strong>Dashboard Status:</strong> All systems operational. The dashboard is working correctly - 
                                it just needs database connectivity to display data.
                            </p>
                        </div>
                    </div>
                `;
            }
            return;
        }
        
        renderAnalytics(analytics);
    } catch (error) {
        console.error("Error loading analytics:", error);
        const container = document.getElementById("summary-content");
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; background: rgba(217, 53, 62, 0.1); border-left: 4px solid #d9353e; border-radius: 8px;">
                    <h3 style="color: #d9353e; margin-bottom: 0.5rem;">⚠️ Unable to load analytics</h3>
                    <p style="color: #9ca3af;">Error: ${error.message}</p>
                    <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.5rem;">Please check your connection and try again.</p>
                </div>
            `;
        }
    }
}

// Load AI analysis
// Analysis is now static HTML - no API calls needed

// Render analytics summary
function renderAnalytics(analytics) {
    const container = document.getElementById("summary-content");
    const stats = analytics.statistics || {};
    const outliers = analytics.outliers || [];
    
    let html = `
        <div class="summary-card">
            <h3>Total Domains</h3>
            <div class="value">${stats.total_domains || 0}</div>
        </div>
        <div class="summary-card">
            <h3>With CMS</h3>
            <div class="value">${stats.domains_with_cms || 0}</div>
        </div>
        <div class="summary-card">
            <h3>With CDN</h3>
            <div class="value">${stats.domains_with_cdn || 0}</div>
        </div>
        <div class="summary-card">
            <h3>Unique ISPs</h3>
            <div class="value">${stats.unique_isps || 0}</div>
        </div>
        <div class="summary-card">
            <h3>Unique Hosts</h3>
            <div class="value">${stats.unique_hosts || 0}</div>
        </div>
    `;
    
    if (outliers.length > 0) {
        html += '<div style="grid-column: 1 / -1; margin-top: 20px;"><h3 style="margin-bottom: 15px; color: #dc3545;">⚠️ Outliers Detected</h3>';
        outliers.forEach(outlier => {
            html += `
                <div class="outlier-card ${outlier.severity}">
                    <div class="outlier-label">${outlier.label}: ${outlier.value}</div>
                    <div class="outlier-value">${outlier.count} domains (${outlier.percentage}%)</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Load domains data
async function loadDomains() {
    try {
        const response = await fetch("/shadowstack/api/domains");
        const data = await response.json();
        domainsData = data.domains || [];
        filteredDomains = [...domainsData];
        
        // Hide empty columns after loading data
        hideEmptyColumns();
        filteredDomains = [...domainsData];
        renderTable();
        updateTableCount();
    } catch (error) {
        console.error("Error loading domains:", error);
        document.getElementById("table-body").innerHTML = 
            '<tr><td colspan="21" class="loading">Error loading data</td></tr>';
    }
}


// Filter graph visualization
function filterGraph() {
    const searchTerm = document.getElementById("graph-search").value.toLowerCase();
    
    // Get node type filter states (domains are always shown)
    const showHosts = document.getElementById("filter-host").checked;
    const showCDNs = document.getElementById("filter-cdn").checked;
    const showCMS = document.getElementById("filter-cms").checked;
    const showRegistrars = document.getElementById("filter-registrar").checked;
    
    if (originalGraphData.nodes.length === 0) {
        graphData = { nodes: [], edges: [] };
        updateGraphCount();
        renderGraph();
        return;
    }
    
    // Filter nodes by type first (domains are always included)
    let filteredNodes = originalGraphData.nodes.filter(node => {
        const label = (node.label || '').toLowerCase();
        const nodeType = node.node_type || (label === 'domain' ? 'domain' : 'service');
        
        // Domains are always shown
        if (label === 'domain' || nodeType === 'domain') {
            // Apply search term if present
            if (searchTerm) {
                const props = node.properties || {};
                const name = (props.name || props.domain || node.id || '').toLowerCase();
                return name.includes(searchTerm);
            }
            return true; // Always show domains if no search term
        }
        
        // Check service type filters
        if (label === 'host') {
            if (!showHosts) return false;
        } else if (label === 'cdn') {
            if (!showCDNs) return false;
        } else if (label === 'cms') {
            if (!showCMS) return false;
        } else if (label === 'registrar') {
            if (!showRegistrars) return false;
        } else {
            // Unknown service type - include it if any service filter is on
            if (!showHosts && !showCDNs && !showCMS && !showRegistrars) {
                return false;
            }
        }
        
        // Apply search term filter if present
        if (searchTerm) {
            const props = node.properties || {};
            const name = (props.name || props.domain || node.id || '').toLowerCase();
            
            // Check if node name or label matches search term
            if (name.includes(searchTerm) || label.includes(searchTerm)) {
                return true;
            }
            
            // Check various properties
            const cdn = (props.cdn || '').toLowerCase();
            const host = (props.host_name || props.name || '').toLowerCase();
            const cms = (props.cms || '').toLowerCase();
            const registrar = (props.registrar || '').toLowerCase();
            const isp = (props.isp || '').toLowerCase();
            
            return cdn.includes(searchTerm) ||
                   host.includes(searchTerm) ||
                   cms.includes(searchTerm) ||
                   registrar.includes(searchTerm) ||
                   isp.includes(searchTerm);
        }
        
        return true; // Passed type filter, no search term
    });
    
    // Create a map of node IDs to filtered node objects for quick lookup
    const filteredNodeIdMap = new Map();
    filteredNodes.forEach(node => {
        filteredNodeIdMap.set(String(node.id), node);
    });
    
    // Filter edges to only include those connecting filtered nodes
    // Map edges to reference the filtered node objects (not original ones)
    const filteredEdges = [];
    originalGraphData.edges.forEach(edge => {
        // Get source and target node IDs from edge (edges already have node objects from loadGraph)
        const sourceId = (typeof edge.source === 'object' && edge.source !== null) 
            ? String(edge.source.id) 
            : String(edge.source);
        const targetId = (typeof edge.target === 'object' && edge.target !== null) 
            ? String(edge.target.id) 
            : String(edge.target);
        
        // Get the filtered node objects (which are the same objects, just filtered)
        const sourceNode = filteredNodeIdMap.get(sourceId);
        const targetNode = filteredNodeIdMap.get(targetId);
        
        if (sourceNode && targetNode) {
            // Create new edge object referencing the filtered nodes
            filteredEdges.push({
                ...edge,
                source: sourceNode,
                target: targetNode
            });
        }
    });
    
    graphData = {
        nodes: filteredNodes,
        edges: filteredEdges
    };
    
    // Update count display
    updateGraphCount();
    
    // Re-render graph with filtered data
    renderGraph();
}

// Update graph node count display
function updateGraphCount() {
    const countElement = document.getElementById("graph-count");
    if (countElement) {
        const nodeCount = graphData.nodes?.length || 0;
        const edgeCount = graphData.edges?.length || 0;
        countElement.textContent = `${nodeCount} nodes, ${edgeCount} connections`;
    }
}


// Initialize column visibility
function initializeColumnVisibility() {
    // First, check which columns have data and hide empty ones
    hideEmptyColumns();
    updateColumnVisibility();
    setupColumnMenu();
}

// Hide columns that have no data across all domains
function hideEmptyColumns() {
    if (domainsData.length === 0) return;
    
    // Always keep these columns visible by default (even if empty)
    const alwaysVisible = ['domain', 'isp', 'host_name', 'cms', 'cdn', 'registrar', 'creation_date'];
    
    // Check each column for data
    Object.keys(columnDefinitions).forEach(colName => {
        // Skip if it's in always visible list
        if (alwaysVisible.includes(colName)) return;
        
        const hasData = domainsData.some(domain => {
            const value = domain[colName];
            if (value === null || value === undefined || value === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return true;
        });
        
        // Remove from visible columns if no data
        if (!hasData && visibleColumns.includes(colName)) {
            visibleColumns = visibleColumns.filter(c => c !== colName);
        }
    });
}

// Update column visibility based on preferences
function updateColumnVisibility() {
    document.querySelectorAll('[data-col]').forEach(el => {
        const colName = el.getAttribute('data-col');
        if (visibleColumns.includes(colName)) {
            el.classList.remove('hidden-col');
        } else {
            el.classList.add('hidden-col');
        }
    });
    
    // Update show all button text
    const allVisible = Object.keys(columnDefinitions).every(col => visibleColumns.includes(col));
    document.getElementById("show-all-btn").textContent = allVisible ? "Show Default" : "Show All Columns";
}

// Setup column menu checkboxes
function setupColumnMenu() {
    const container = document.getElementById("column-checkboxes");
    container.innerHTML = '';
    
    Object.entries(columnDefinitions).forEach(([key, label]) => {
        const item = document.createElement('div');
        item.className = 'column-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `col-${key}`;
        checkbox.checked = visibleColumns.includes(key);
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!visibleColumns.includes(key)) {
                    visibleColumns.push(key);
                }
            } else {
                visibleColumns = visibleColumns.filter(c => c !== key);
            }
            updateColumnVisibility();
        });
        
        const labelEl = document.createElement('label');
        labelEl.htmlFor = `col-${key}`;
        labelEl.textContent = label;
        
        item.appendChild(checkbox);
        item.appendChild(labelEl);
        container.appendChild(item);
    });
}

// Show all columns
function showAllColumns() {
    const allVisible = Object.keys(columnDefinitions).every(col => visibleColumns.includes(col));
    
    if (allVisible) {
        // Show only default columns
        visibleColumns = [...defaultVisibleColumns];
    } else {
        // Show all columns
        visibleColumns = Object.keys(columnDefinitions);
    }
    
    updateColumnVisibility();
    setupColumnMenu();
}

// Toggle column menu
function toggleColumnMenu() {
    const menu = document.getElementById("column-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// Save column settings
function saveColumnSettings() {
    saveColumnPreferences();
    document.getElementById("column-menu").style.display = "none";
    // Show confirmation
    const btn = document.getElementById("save-columns-btn");
    const originalText = btn.textContent;
    btn.textContent = "✓ Saved!";
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// Reset column settings
function resetColumnSettings() {
    visibleColumns = [...defaultVisibleColumns];
    updateColumnVisibility();
    setupColumnMenu();
    saveColumnPreferences();
}

// Render table
function renderTable() {
    const tbody = document.getElementById("table-body");
    
    if (filteredDomains.length === 0) {
        tbody.innerHTML = '<tr><td colspan="21" class="loading">No domains found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredDomains.map((domain, index) => {
        // Helper to format arrays/lists
        const formatArray = (value, maxItems = 3) => {
            if (!value) return '<span class="empty">—</span>';
            if (Array.isArray(value)) {
                if (value.length === 0) return '<span class="empty">—</span>';
                const display = value.slice(0, maxItems).join(', ');
                const more = value.length > maxItems ? ` (+${value.length - maxItems})` : '';
                return escapeHtml(display + more);
            }
            return escapeHtml(String(value));
        };
        
        // Helper to format dates
        const formatDate = (dateStr) => {
            if (!dateStr) return '<span class="empty">—</span>';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            } catch {
                return escapeHtml(String(dateStr).substring(0, 10));
            }
        };
        
        // Handle both arrays and None/null values
        const ipAddresses = Array.isArray(domain.ip_addresses) ? domain.ip_addresses : 
                           (domain.ip_addresses ? [domain.ip_addresses] : []);
        const ipv6Addresses = Array.isArray(domain.ipv6_addresses) ? domain.ipv6_addresses : 
                             (domain.ipv6_addresses ? [domain.ipv6_addresses] : []);
        const nameServers = Array.isArray(domain.name_servers) ? domain.name_servers : 
                           (domain.name_servers ? [domain.name_servers] : []);
        const mxRecords = Array.isArray(domain.mx_records) ? domain.mx_records : 
                         (domain.mx_records ? [domain.mx_records] : []);
        const frameworks = Array.isArray(domain.frameworks) ? domain.frameworks : 
                          (domain.frameworks ? [domain.frameworks] : []);
        const analytics = Array.isArray(domain.analytics) ? domain.analytics : 
                         (domain.analytics ? [domain.analytics] : []);
        const languages = Array.isArray(domain.languages) ? domain.languages : 
                         (domain.languages ? [domain.languages] : []);
        
        // Try to extract from dns_records if ip_addresses is empty
        if (ipAddresses.length === 0 && domain.dns_records) {
            const dns = typeof domain.dns_records === 'string' ? JSON.parse(domain.dns_records) : domain.dns_records;
            if (dns && dns.A) {
                ipAddresses.push(...(Array.isArray(dns.A) ? dns.A : [dns.A]));
            }
            if (dns && dns.AAAA) {
                ipv6Addresses.push(...(Array.isArray(dns.AAAA) ? dns.AAAA : [dns.AAAA]));
            }
        }
        
        // Try to extract name servers from dns_records or whois_data
        if (nameServers.length === 0) {
            if (domain.dns_records) {
                const dns = typeof domain.dns_records === 'string' ? JSON.parse(domain.dns_records) : domain.dns_records;
                if (dns && dns.NS) {
                    nameServers.push(...(Array.isArray(dns.NS) ? dns.NS : [dns.NS]));
                }
            }
            if (domain.whois_data) {
                const whois = typeof domain.whois_data === 'string' ? JSON.parse(domain.whois_data) : domain.whois_data;
                if (whois && whois.name_servers) {
                    const ns = Array.isArray(whois.name_servers) ? whois.name_servers : [whois.name_servers];
                    nameServers.push(...ns);
                }
            }
        }
        
        // Try to extract MX records from dns_records
        if (mxRecords.length === 0 && domain.dns_records) {
            const dns = typeof domain.dns_records === 'string' ? JSON.parse(domain.dns_records) : domain.dns_records;
            if (dns && dns.MX) {
                mxRecords.push(...(Array.isArray(dns.MX) ? dns.MX : [dns.MX]));
            }
        }
        
        // Try to extract tech stack data from tech_stack field
        if (domain.tech_stack) {
            let techStack = domain.tech_stack;
            if (typeof techStack === 'string') {
                try {
                    techStack = JSON.parse(techStack);
                } catch (e) {
                    techStack = null;
                }
            }
            
            if (techStack && typeof techStack === 'object') {
                // Extract frameworks
                if (techStack.frameworks && frameworks.length === 0) {
                    frameworks.push(...(Array.isArray(techStack.frameworks) ? techStack.frameworks : [techStack.frameworks]));
                }
                if (techStack.javascript_frameworks && frameworks.length === 0) {
                    frameworks.push(...(Array.isArray(techStack.javascript_frameworks) ? techStack.javascript_frameworks : [techStack.javascript_frameworks]));
                }
                
                // Extract analytics
                if (techStack.analytics && analytics.length === 0) {
                    analytics.push(...(Array.isArray(techStack.analytics) ? techStack.analytics : [techStack.analytics]));
                }
                
                // Extract languages
                if (techStack.programming_languages && languages.length === 0) {
                    languages.push(...(Array.isArray(techStack.programming_languages) ? techStack.programming_languages : [techStack.programming_languages]));
                }
                if (techStack.languages && languages.length === 0) {
                    languages.push(...(Array.isArray(techStack.languages) ? techStack.languages : [techStack.languages]));
                }
            }
        }
        
        // Build row cells in header order
        const cellMap = {
            'row-number': `<td class="row-number">${index + 1}</td>`,
            'domain': `<td class="col-domain"><strong>${escapeHtml(domain.domain || 'N/A')}</strong></td>`,
            'isp': `<td class="col-isp" title="${escapeHtml(domain.isp || '')}">${escapeHtml((domain.isp || '').substring(0, 30)) || '<span class="empty">—</span>'}</td>`,
            'host_name': `<td class="col-host" title="${escapeHtml(domain.host_name || '')}">${escapeHtml((domain.host_name || '').substring(0, 25)) || '<span class="empty">—</span>'}</td>`,
            'cms': `<td class="col-cms">${escapeHtml(domain.cms || '') || '<span class="empty">—</span>'}</td>`,
            'cdn': `<td class="col-cdn">${escapeHtml(domain.cdn || '') || '<span class="empty">—</span>'}</td>`,
            'registrar': `<td class="col-registrar" title="${escapeHtml(domain.registrar || '')}">${escapeHtml((domain.registrar || '').substring(0, 25)) || '<span class="empty">—</span>'}</td>`,
            'creation_date': `<td class="col-created">${formatDate(domain.creation_date)}</td>`,
            'frameworks': `<td class="col-frameworks" title="${escapeHtml(Array.isArray(frameworks) ? frameworks.join(', ') : (frameworks || ''))}">${formatArray(frameworks)}</td>`,
            'ip_address': `<td class="col-ip" title="${escapeHtml(domain.ip_address || '')}">${escapeHtml(domain.ip_address || '') || '<span class="empty">—</span>'}</td>`,
            'asn': `<td class="col-asn">${escapeHtml(domain.asn || '') || '<span class="empty">—</span>'}</td>`,
            'web_server': `<td class="col-webserver" title="${escapeHtml(domain.web_server || '')}">${escapeHtml((domain.web_server || '').substring(0, 20)) || '<span class="empty">—</span>'}</td>`,
            'payment_processor': `<td class="col-payment" title="${escapeHtml(domain.payment_processor || '')}">${escapeHtml((domain.payment_processor || '').substring(0, 20)) || '<span class="empty">—</span>'}</td>`,
            'expiration_date': `<td class="col-expires">${formatDate(domain.expiration_date)}</td>`,
            'analytics': `<td class="col-analytics" title="${escapeHtml(Array.isArray(analytics) ? analytics.join(', ') : (analytics || ''))}">${formatArray(analytics)}</td>`,
            'languages': `<td class="col-languages" title="${escapeHtml(Array.isArray(languages) ? languages.join(', ') : (languages || ''))}">${formatArray(languages)}</td>`,
            'ip_addresses': `<td class="col-ipv4" title="${escapeHtml(ipAddresses.join(', ') || '')}">${formatArray(ipAddresses, 2)}</td>`,
            'ipv6_addresses': `<td class="col-ipv6" title="${escapeHtml(ipv6Addresses.join(', ') || '')}">${formatArray(ipv6Addresses, 2)}</td>`,
            'name_servers': `<td class="col-nameservers" title="${escapeHtml(nameServers.join(', ') || '')}">${formatArray(nameServers, 2)}</td>`,
            'mx_records': `<td class="col-mx" title="${escapeHtml(mxRecords.join(', ') || '')}">${formatArray(mxRecords, 2)}</td>`
        };
        
        // Get header order from table
        const headerOrder = [];
        document.querySelectorAll('#domains-table thead th[data-col]').forEach(th => {
            const colName = th.getAttribute('data-col');
            if (colName) {
                headerOrder.push(colName);
            }
        });
        
        // Build row in header order
        const rowCells = ['<td class="row-number">' + (index + 1) + '</td>']; // Row number always first
        
        headerOrder.forEach(colName => {
            if (visibleColumns.includes(colName) && cellMap[colName]) {
                rowCells.push(cellMap[colName]);
            }
        });
        
        return `<tr>${rowCells.join('')}</tr>`;
    }).join('');
}

// Filter table
function filterTable() {
    const searchTerm = document.getElementById("table-search").value.toLowerCase();
    const filterColumn = document.getElementById("filter-column").value;
    
    filteredDomains = domainsData.filter(domain => {
        if (!searchTerm) return true;
        
        if (filterColumn) {
            const value = String(domain[filterColumn] || '').toLowerCase();
            return value.includes(searchTerm);
        } else {
            // Search all columns
            return Object.values(domain).some(value => 
                String(value || '').toLowerCase().includes(searchTerm)
            );
        }
    });
    
    // Apply current sort
    if (currentSort.column) {
        sortTable(currentSort.column, false);
    } else {
        renderTable();
    }
    updateTableCount();
}

// Sort table
function sortTable(column, toggleDirection = true) {
    // Update sort indicators
    document.querySelectorAll(".sortable").forEach(th => {
        th.classList.remove("active");
        th.textContent = th.textContent.replace(/ ↑| ↓/, '') + ' ↕';
    });
    
    const th = document.querySelector(`[data-column="${column}"]`);
    if (!th) return;
    
    // Toggle direction if same column
    if (toggleDirection && currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    th.classList.add("active");
    th.textContent = th.textContent.replace(/ ↕| ↑| ↓/, '') + 
        (currentSort.direction === 'asc' ? ' ↑' : ' ↓');
    
    // Sort data
    filteredDomains.sort((a, b) => {
        const aVal = String(a[column] || '').toLowerCase();
        const bVal = String(b[column] || '').toLowerCase();
        
        if (currentSort.direction === 'asc') {
            return aVal.localeCompare(bVal);
        } else {
            return bVal.localeCompare(aVal);
        }
    });
    
    renderTable();
}

// Update table count
function updateTableCount() {
    const count = filteredDomains.length;
    const total = domainsData.length;
    document.getElementById("table-count").textContent = 
        `${count} ${count === 1 ? 'domain' : 'domains'}${count !== total ? ` of ${total}` : ''}`;
}

// Render the graph
function renderGraph() {
    // Ensure SVG is initialized
    if (!svg || !g) {
        initGraphView();
    }
    
    // Clear existing content
    g.selectAll("*").remove();
    
    if (!graphData.nodes || graphData.nodes.length === 0) {
        const width = svg.attr("width") || 1200;
        const height = svg.attr("height") || 600;
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("fill", "#6c757d")
            .text("No data available. Run the enrichment pipeline first.");
        return;
    }
    
    console.log(`Rendering graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
    updateGraphCount(); // Update count display
    
    // Get SVG dimensions
    const width = parseInt(svg.attr("width")) || 1200;
    const height = parseInt(svg.attr("height")) || 600;
    
    // Create links
    const links = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graphData.edges)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1.5);
    
    // Create nodes - domains first, then services
    const nodes = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("class", d => {
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            const label = (d.label || "").toLowerCase();
            return `node ${nodeType} ${label}`;
        })
        .attr("r", d => getNodeSize(d))
        .attr("stroke-width", d => {
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            return nodeType === "domain" ? 3 : 2;
        })
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip)
        .on("click", (event, d) => showNodeDetails(d));
    
    // Add labels with different styling for domains vs services
    const labels = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graphData.nodes)
        .enter()
        .append("text")
        .attr("class", d => {
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            return `node-label label-${nodeType}`;
        })
        .attr("font-weight", d => {
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            return nodeType === "domain" ? "bold" : "normal";
        })
        .attr("font-size", d => {
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            return nodeType === "domain" ? "13px" : "11px";
        })
        .text(d => {
            const props = d.properties || {};
            const name = props.name || props.domain || d.id || "Unknown";
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            
            // For domains, show full name (truncated if needed)
            // For services, show shorter version
            if (nodeType === "domain") {
                return name.length > 25 ? name.substring(0, 25) + "..." : name;
            } else {
                return name.length > 15 ? name.substring(0, 15) + "..." : name;
            }
        });
    
    // Stop any existing simulation
    if (simulation) {
        simulation.stop();
    }
    
    // Create force simulation
    // Ensure nodes have x,y coordinates initialized for better initial layout
    graphData.nodes.forEach((node, i) => {
        if (!node.x) {
            const angle = (i / graphData.nodes.length) * 2 * Math.PI;
            node.x = width / 2 + Math.cos(angle) * 200;
        }
        if (!node.y) {
            const angle = (i / graphData.nodes.length) * 2 * Math.PI;
            node.y = height / 2 + Math.sin(angle) * 200;
        }
    });
    
    // Create link force with proper ID mapping
    const linkForce = d3.forceLink(graphData.edges)
        .id(d => String(d.id))
        .distance(120)
        .strength(0.3);
    
    simulation = d3.forceSimulation(graphData.nodes)
        .force("link", linkForce)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => getNodeSize(d) + 10))
        .alpha(1)
        .alphaDecay(0.022)
        .velocityDecay(0.4);
    
    console.log("Force simulation created with", graphData.nodes.length, "nodes");
    
    // Track if we've centered on Cloudflare (only do this once on initial load)
    let cloudflareCentered = false;
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
        links
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y + 5);
        
        // Center on Cloudflare after simulation stabilizes (only once)
        if (!cloudflareCentered && simulation.alpha() < 0.1) {
            cloudflareCentered = true;
            centerOnCloudflare();
        }
    });
    
    // Also center on Cloudflare when simulation ends (backup)
    simulation.on("end", () => {
        if (!cloudflareCentered) {
            cloudflareCentered = true;
            centerOnCloudflare();
        }
    });
    
    // Add drag behavior after nodes are created
    nodes.call(drag(simulation));
}

// Center the view on Cloudflare nodes
function centerOnCloudflare() {
    if (!graphData.nodes || graphData.nodes.length === 0) return;
    
    // Find Cloudflare nodes
    const cloudflareNodes = graphData.nodes.filter(node => {
        const props = node.properties || {};
        const name = (props.name || props.domain || node.id || "").toLowerCase();
        return name.includes("cloudflare");
    });
    
    if (cloudflareNodes.length === 0) {
        console.log("No Cloudflare nodes found to center on");
        return;
    }
    
    console.log(`Centering on ${cloudflareNodes.length} Cloudflare node(s)`);
    
    // Find all nodes connected to Cloudflare (neighbors)
    const cloudflareNodeIds = new Set(cloudflareNodes.map(n => String(n.id)));
    const connectedNodes = new Set();
    
    graphData.edges.forEach(edge => {
        const sourceId = String(edge.source.id || edge.source);
        const targetId = String(edge.target.id || edge.target);
        
        if (cloudflareNodeIds.has(sourceId)) {
            connectedNodes.add(targetId);
        }
        if (cloudflareNodeIds.has(targetId)) {
            connectedNodes.add(sourceId);
        }
    });
    
    // Get all nodes to include in the view (Cloudflare + connected nodes)
    const nodesToShow = graphData.nodes.filter(node => {
        const nodeId = String(node.id);
        return cloudflareNodeIds.has(nodeId) || connectedNodes.has(nodeId);
    });
    
    if (nodesToShow.length === 0) {
        nodesToShow.push(...cloudflareNodes);
    }
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodesToShow.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
            const radius = getNodeSize(node) + 20; // Add padding
            minX = Math.min(minX, node.x - radius);
            minY = Math.min(minY, node.y - radius);
            maxX = Math.max(maxX, node.x + radius);
            maxY = Math.max(maxY, node.y + radius);
        }
    });
    
    // If no valid coordinates, skip
    if (minX === Infinity) {
        console.log("Cloudflare nodes don't have coordinates yet");
        return;
    }
    
    // Calculate center and dimensions
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Get SVG dimensions
    const svgWidth = parseInt(svg.attr("width")) || 1200;
    const svgHeight = parseInt(svg.attr("height")) || 600;
    
    // Calculate zoom level to fit the bounding box with padding
    const padding = 50;
    const scaleX = (svgWidth - padding * 2) / width;
    const scaleY = (svgHeight - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY, 2); // Cap zoom at 2x
    
    // Calculate transform to center on Cloudflare
    const translateX = svgWidth / 2 - centerX * scale;
    const translateY = svgHeight / 2 - centerY * scale;
    
    // Apply zoom and pan transform
    // Create a new zoom behavior and apply the transform
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    const transform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);
    
    svg.transition()
        .duration(1000)
        .call(zoomBehavior.transform, transform);
    
    console.log(`Centered on Cloudflare: scale=${scale.toFixed(2)}, center=(${centerX.toFixed(0)}, ${centerY.toFixed(0)})`);
}

// Get node size based on type
function getNodeSize(node) {
    const nodeType = node.node_type || node.label?.toLowerCase();
    const isDomain = nodeType === "domain";
    
    // Domains are larger and more prominent
    if (isDomain) {
        return 14;  // Larger for domains
    }
    
    // Services are smaller
    const labelLower = node.label?.toLowerCase() || "";
    const sizes = {
        "host": 8,
        "cdn": 7,
        "cms": 7,
        "paymentprocessor": 7,
        "payment": 7
    };
    return sizes[labelLower] || 8;
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Tooltip functions
function showTooltip(event, d) {
    const tooltip = d3.select("#tooltip");
    const props = d.properties || {};
    
    const name = props.name || props.domain || d.id || "Unknown";
    let content = `<h4>${escapeHtml(name)}</h4>`;
    content += `<p><strong>Type:</strong> ${escapeHtml(d.label || "Unknown")}</p>`;
    
    if (props.isp) content += `<p><strong>ISP:</strong> ${escapeHtml(props.isp)}</p>`;
    if (props.asn) content += `<p><strong>ASN:</strong> ${escapeHtml(String(props.asn))}</p>`;
    if (props.source) content += `<p><strong>Source:</strong> ${escapeHtml(props.source)}</p>`;
    if (props.ip) content += `<p><strong>IP:</strong> ${escapeHtml(props.ip)}</p>`;
    
    tooltip
        .html(content)
        .classed("show", true);
}

function moveTooltip(event) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
}

function hideTooltip() {
    d3.select("#tooltip")
        .classed("show", false);
}

// Export data
function exportData() {
    const dataStr = JSON.stringify({
        graph: graphData,
        domains: domainsData,
        exported_at: new Date().toISOString()
    }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-pornography-infrastructure-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Show node details modal
async function showNodeDetails(node) {
    const modal = document.getElementById("node-modal");
    const modalBody = document.getElementById("modal-body");
    
    const nodeType = node.node_type || (node.label?.toLowerCase() === "domain" ? "domain" : "service");
    const props = node.properties || {};
    
    let html = '';
    
    if (nodeType === "domain") {
        // Show domain details
        const domainName = props.domain || props.name || node.id;
        
        // Find full domain data
        const domainData = domainsData.find(d => d.domain === domainName) || {};
        
        html = `
            <div class="modal-header">
                <h2>${escapeHtml(domainName)}</h2>
                <span class="node-type domain">Domain</span>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <h3>🌐 Domain Information</h3>
                    <div class="info-row">
                        <span class="info-label">Domain:</span>
                        <span class="info-value">${escapeHtml(domainName)}</span>
                    </div>
                    ${domainData.registrar ? `<div class="info-row">
                        <span class="info-label">Registrar:</span>
                        <span class="info-value">${escapeHtml(domainData.registrar)}</span>
                    </div>` : ''}
                    ${domainData.creation_date ? `<div class="info-row">
                        <span class="info-label">Created:</span>
                        <span class="info-value">${formatDateForModal(domainData.creation_date)}</span>
                    </div>` : ''}
                    ${domainData.expiration_date ? `<div class="info-row">
                        <span class="info-label">Expires:</span>
                        <span class="info-value">${formatDateForModal(domainData.expiration_date)}</span>
                    </div>` : ''}
                </div>
                
                <div class="modal-section">
                    <h3>🖥️ Hosting & Infrastructure</h3>
                    ${domainData.ip_address ? `<div class="info-row">
                        <span class="info-label">IP Address:</span>
                        <span class="info-value">${escapeHtml(domainData.ip_address)}</span>
                    </div>` : ''}
                    ${domainData.host_name ? `<div class="info-row">
                        <span class="info-label">Host:</span>
                        <span class="info-value">${escapeHtml(domainData.host_name)}</span>
                    </div>` : ''}
                    ${domainData.isp ? `<div class="info-row">
                        <span class="info-label">ISP:</span>
                        <span class="info-value">${escapeHtml(domainData.isp)}</span>
                    </div>` : ''}
                    ${domainData.asn ? `<div class="info-row">
                        <span class="info-label">ASN:</span>
                        <span class="info-value">${escapeHtml(domainData.asn)}</span>
                    </div>` : ''}
                </div>
                
                <div class="modal-section">
                    <h3>🔧 Technology Stack</h3>
                    ${domainData.cms ? `<div class="info-row">
                        <span class="info-label">CMS:</span>
                        <span class="info-value">${escapeHtml(domainData.cms)}</span>
                    </div>` : ''}
                    ${domainData.cdn ? `<div class="info-row">
                        <span class="info-label">CDN:</span>
                        <span class="info-value">${escapeHtml(domainData.cdn)}</span>
                    </div>` : ''}
                    ${domainData.web_server ? `<div class="info-row">
                        <span class="info-label">Web Server:</span>
                        <span class="info-value">${escapeHtml(domainData.web_server)}</span>
                    </div>` : ''}
                    ${domainData.frameworks && (Array.isArray(domainData.frameworks) ? domainData.frameworks.length > 0 : domainData.frameworks) ? `<div class="info-row">
                        <span class="info-label">Frameworks:</span>
                        <span class="info-value">${escapeHtml(Array.isArray(domainData.frameworks) ? domainData.frameworks.join(', ') : String(domainData.frameworks))}</span>
                    </div>` : ''}
                    ${domainData.analytics && (Array.isArray(domainData.analytics) ? domainData.analytics.length > 0 : domainData.analytics) ? `<div class="info-row">
                        <span class="info-label">Analytics:</span>
                        <span class="info-value">${escapeHtml(Array.isArray(domainData.analytics) ? domainData.analytics.join(', ') : String(domainData.analytics))}</span>
                    </div>` : ''}
                    ${domainData.languages && (Array.isArray(domainData.languages) ? domainData.languages.length > 0 : domainData.languages) ? `<div class="info-row">
                        <span class="info-label">Languages:</span>
                        <span class="info-value">${escapeHtml(Array.isArray(domainData.languages) ? domainData.languages.join(', ') : String(domainData.languages))}</span>
                    </div>` : ''}
                </div>
                
                ${domainData.payment_processor ? `<div class="modal-section">
                    <h3>💳 Payment</h3>
                    <div class="info-row">
                        <span class="info-label">Payment Processor:</span>
                        <span class="info-value">${escapeHtml(domainData.payment_processor)}</span>
                    </div>
                </div>` : ''}
            </div>
        `;
    } else {
        // Show service details
        const serviceName = props.name || props.domain || node.id;
        const serviceType = node.label || "Service";
        
        // Count how many domains use this service
        const domainsUsingService = countDomainsUsingService(serviceName, serviceType);
        const totalDomains = domainsData.length;
        const percentage = totalDomains > 0 ? ((domainsUsingService / totalDomains) * 100).toFixed(1) : 0;
        
        html = `
            <div class="modal-header">
                <h2>${escapeHtml(serviceName)}</h2>
                <span class="node-type service">${escapeHtml(serviceType)}</span>
            </div>
            <div class="service-stats">
                <h3>📊 Usage Statistics</h3>
                <div class="stat-big">${domainsUsingService}</div>
                <div class="stat-label">domains use this service</div>
                <div style="margin-top: 15px; font-size: 1.2em;">
                    ${percentage}% of all domains
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <h3>ℹ️ Service Information</h3>
                    <div class="info-row">
                        <span class="info-label">Service Name:</span>
                        <span class="info-value">${escapeHtml(serviceName)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Service Type:</span>
                        <span class="info-value">${escapeHtml(serviceType)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Domains Using:</span>
                        <span class="info-value">${domainsUsingService} of ${totalDomains}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Usage Percentage:</span>
                        <span class="info-value">${percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = html;
    modal.classList.add("show");
    modal.style.display = "flex";
}

// Count domains using a specific service
function countDomainsUsingService(serviceName, serviceType) {
    if (!domainsData || domainsData.length === 0) return 0;
    
    const serviceTypeLower = (serviceType || "").toLowerCase();
    const serviceNameLower = (serviceName || "").toLowerCase();
    
    return domainsData.filter(domain => {
        if (serviceTypeLower === "host") {
            return domain.host_name && domain.host_name.toLowerCase().includes(serviceNameLower);
        } else if (serviceTypeLower === "cms") {
            return domain.cms && domain.cms.toLowerCase().includes(serviceNameLower);
        } else if (serviceTypeLower === "cdn") {
            return domain.cdn && domain.cdn.toLowerCase().includes(serviceNameLower);
        } else if (serviceTypeLower === "registrar") {
            return domain.registrar && domain.registrar.toLowerCase().includes(serviceNameLower);
        }
        return false;
    }).length;
}

// Close modal
function closeModal() {
    const modal = document.getElementById("node-modal");
    modal.classList.remove("show");
    modal.style.display = "none";
}

// Format date for modal
function formatDateForModal(dateStr) {
    if (!dateStr) return '<span class="empty">—</span>';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return escapeHtml(String(dateStr).substring(0, 10));
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initVisualization);
