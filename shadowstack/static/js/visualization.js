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
        loadDomains(); // Load domains when table view is shown
    });
    document.getElementById("dns-history-view-btn").addEventListener("click", () => {
        switchView("dns-history");
        localStorage.setItem('lastView', 'dns-history');
        loadDnsHistory(); // Load DNS history when view is shown
    });
    document.getElementById("analysis-view-btn").addEventListener("click", () => {
        switchView("analysis");
        localStorage.setItem('lastView', 'analysis');
        loadAnalysis(); // Load analysis when view is shown
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
    // Hide "Show All Columns" button since new columns are empty
    const showAllBtn = document.getElementById("show-all-btn");
    if (showAllBtn) {
        showAllBtn.style.display = "none";
    }
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
    const dnsHistoryView = document.getElementById("dns-history-view");
    const analysisView = document.getElementById("analysis-view");
    const aboutView = document.getElementById("about-view");
    const graphBtn = document.getElementById("graph-view-btn");
    const tableBtn = document.getElementById("table-view-btn");
    const dnsHistoryBtn = document.getElementById("dns-history-view-btn");
    const analysisBtn = document.getElementById("analysis-view-btn");
    const aboutBtn = document.getElementById("about-view-btn");
    const resetZoomBtn = document.getElementById("reset-zoom-btn");
    
    // Hide all views
    graphView.style.display = "none";
    tableView.style.display = "none";
    dnsHistoryView.style.display = "none";
    analysisView.style.display = "none";
    aboutView.style.display = "none";
    
    // Remove active class from all buttons
    graphBtn.classList.remove("active");
    tableBtn.classList.remove("active");
    dnsHistoryBtn.classList.remove("active");
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
        } else {
            // Data already loaded, just render the table
            renderTable();
            updateTableCount();
        }
    } else if (view === "dns-history") {
        dnsHistoryView.style.display = "block";
        dnsHistoryBtn.classList.add("active");
        resetZoomBtn.style.display = "none";
        loadDnsHistory(); // Load DNS history when view is shown
    } else if (view === "analysis") {
        analysisView.style.display = "block";
        analysisBtn.classList.add("active");
        resetZoomBtn.style.display = "none";
        loadAnalysis(); // Load analysis when view is shown
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
        
        // Format stats - exclude CDN and CMS as they're confusing (domain counts are more meaningful)
        const statsHtml = `
            <strong>Nodes:</strong> ${stats.total_nodes || 0} | 
            <strong>Edges:</strong> ${stats.total_edges || 0} |
            ${Object.entries(stats.node_types || {})
                .filter(([type]) => !['Cdn', 'Cms', 'cdn', 'cms'].includes(type)) // Exclude CDN and CMS
                .map(([type, count]) => `<strong>${type}:</strong> ${count}`)
                .join(" | ")}
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

// Load AI analysis (cached, not regenerated dynamically)
async function loadAnalysis() {
    const container = document.getElementById("analysis-content");
    if (!container) {
        console.error("Analysis container not found");
        return;
    }
    
    try {
        container.innerHTML = '<div class="loading">Loading analysis...</div>';
        
        const response = await fetch("/shadowstack/api/analysis");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle error response
        if (data.error) {
            if (data.needs_regeneration) {
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3 style="color: #f97373; margin-bottom: 15px;">No cached analysis available</h3>
                        <p style="margin-bottom: 20px; color: #a0a0a0;">The analysis needs to be generated. This may take a few minutes.</p>
                        <button onclick="generateAnalysis()" style="background: #d9353e; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                            Generate Analysis
                        </button>
                        <p style="margin-top: 15px; font-size: 12px; color: #666;">
                            Or visit: <a href="/shadowstack/api/analysis?force=true" target="_blank" style="color: #4a9eff;">/shadowstack/api/analysis?force=true</a>
                        </p>
                    </div>
                `;
            } else {
                container.innerHTML = `<div class="error" style="padding: 20px; color: #f97373;">Error: ${data.error}</div>`;
            }
            return;
        }
        
        // Display the cached analysis
        if (data.analysis) {
            // The analysis is already HTML, just insert it
            container.innerHTML = data.analysis;
            console.log("✅ Analysis loaded successfully");
        } else {
            container.innerHTML = '<div class="error" style="padding: 20px; color: #f97373;">No analysis data available</div>';
        }
    } catch (error) {
        console.error("Error loading analysis:", error);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #f97373;">
                <h3>Error loading analysis</h3>
                <p>${error.message}</p>
                <button onclick="loadAnalysis()" style="background: #d9353e; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin-top: 15px;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Generate analysis (called by button)
async function generateAnalysis() {
    const container = document.getElementById("analysis-content");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Generating analysis (this may take a few minutes)...</div>';
    
    try {
        const response = await fetch("/shadowstack/api/analysis?force=true");
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error" style="padding: 20px; color: #f97373;">Error: ${data.error}</div>`;
            return;
        }
        
        if (data.analysis) {
            container.innerHTML = data.analysis;
        } else {
            container.innerHTML = '<div class="error" style="padding: 20px; color: #f97373;">Analysis generation failed</div>';
        }
    } catch (error) {
        console.error("Error generating analysis:", error);
        container.innerHTML = `<div class="error" style="padding: 20px; color: #f97373;">Error: ${error.message}</div>`;
    }
}

// Load DNS history
async function loadDnsHistory() {
    const container = document.getElementById("dns-history-content");
    const statsContainer = document.getElementById("dns-stats");
    const searchInput = document.getElementById("dns-search");
    
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading">Loading DNS history...</div>';
        
        const response = await fetch("/shadowstack/api/dns-history");
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `<div class="error" style="padding: 20px; color: #f97373;">Error: ${data.error}</div>`;
            return;
        }
        
        const domains = data.domains || [];
        
        // Store domains globally for filtering
        window.dnsHistoryDomains = domains;
        
        // Normalize country names to full names and consolidate duplicates
        // Make it globally available for filtering
        window.normalizeCountryName = function(country, location) {
            if (!country && !location) return 'Unknown';
            
            const countryLower = (country || '').toLowerCase().trim();
            const locationLower = (location || '').toLowerCase().trim();
            const combined = `${countryLower} ${locationLower}`.trim();
            
            // Map abbreviations and variations to full country names
            const countryMap = {
                'us': 'United States',
                'usa': 'United States',
                'united states': 'United States',
                'united states of america': 'United States',
                'de': 'Germany',
                'germany': 'Germany',
                'deutschland': 'Germany',
                'gb': 'United Kingdom',
                'uk': 'United Kingdom',
                'united kingdom': 'United Kingdom',
                'great britain': 'United Kingdom',
                'fr': 'France',
                'france': 'France',
                'nl': 'Netherlands',
                'netherlands': 'Netherlands',
                'the netherlands': 'Netherlands',
                'holland': 'Netherlands',
                'ru': 'Russia',
                'russia': 'Russia',
                'russian federation': 'Russia',
                'ca': 'Canada',
                'canada': 'Canada',
                'ch': 'Switzerland',
                'switzerland': 'Switzerland',
                'swiss': 'Switzerland',
                'vg': 'British Virgin Islands',
                'british virgin islands': 'British Virgin Islands',
                'bvi': 'British Virgin Islands',
                'ie': 'Ireland',
                'ireland': 'Ireland',
                'se': 'Sweden',
                'sweden': 'Sweden',
                'no': 'Norway',
                'norway': 'Norway',
                'dk': 'Denmark',
                'denmark': 'Denmark',
                'fi': 'Finland',
                'finland': 'Finland',
                'pl': 'Poland',
                'poland': 'Poland',
                'es': 'Spain',
                'spain': 'Spain',
                'it': 'Italy',
                'italy': 'Italy',
                'au': 'Australia',
                'australia': 'Australia',
                'jp': 'Japan',
                'japan': 'Japan',
                'cn': 'China',
                'china': 'China',
                'in': 'India',
                'india': 'India',
                'sg': 'Singapore',
                'singapore': 'Singapore',
                'hk': 'Hong Kong',
                'hong kong': 'Hong Kong',
                'unknown': 'Unknown'
            };
            
            // Check exact matches first
            if (countryMap[countryLower]) {
                return countryMap[countryLower];
            }
            if (countryMap[locationLower]) {
                return countryMap[locationLower];
            }
            if (countryMap[combined]) {
                return countryMap[combined];
            }
            
            // Check if location contains country name
            for (const [key, value] of Object.entries(countryMap)) {
                if (combined.includes(key) || locationLower.includes(key)) {
                    return value;
                }
            }
            
            // If location has a country name, extract it
            if (locationLower) {
                for (const [key, value] of Object.entries(countryMap)) {
                    if (locationLower.includes(key)) {
                        return value;
                    }
                }
            }
            
            // Capitalize first letter of each word if not found
            if (country) {
                return country.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
            }
            
            return 'Unknown';
        };
        
        // Calculate country statistics (unique domains per country)
        const countryStats = {};
        domains.forEach(domainData => {
            const domain = domainData.domain;
            const ips = domainData.historical_ips || [];
            
            // Get unique countries for this domain
            const domainCountries = new Set();
            ips.forEach(ipRecord => {
                const normalizedCountry = window.normalizeCountryName(
                    ipRecord.country, 
                    ipRecord.location
                );
                domainCountries.add(normalizedCountry);
            });
            
            // Count this domain for each country it appears in
            domainCountries.forEach(country => {
                if (!countryStats[country]) {
                    countryStats[country] = {
                        country: country,
                        domainCount: 0,
                        totalIPs: 0
                    };
                }
                countryStats[country].domainCount++;
                countryStats[country].totalIPs += new Set(ips.map(ip => ip.ip)).size;
            });
        });
        
        // Sort countries by domain count (most common first)
        const topCountries = Object.values(countryStats)
            .sort((a, b) => b.domainCount - a.domainCount)
            .slice(0, 10); // Top 10 countries
        
        // Update stats
        if (statsContainer) {
            statsContainer.innerHTML = `
                <strong>Total:</strong> ${data.total || 0} domains | 
                <strong>With History:</strong> ${data.domains_with_history || 0} domains
            `;
        }
        
        // Render domains
        if (domains.length === 0) {
            container.innerHTML = '<div class="error" style="padding: 20px; color: #f97373;">No DNS history data available</div>';
            return;
        }
        
        // Build HTML with summary cards first
        let html = '';
        
        // Add country summary cards
        if (topCountries.length > 0) {
            html += '<div class="dns-country-summary">';
            html += '<h3 style="margin-bottom: 15px; color: #f3f4f7;">Top Countries by Domain Count</h3>';
            html += '<div class="dns-country-cards">';
            
            topCountries.forEach(countryStat => {
                const percentage = ((countryStat.domainCount / data.total) * 100).toFixed(1);
                html += `
                    <div class="dns-country-card" data-filter-country="${countryStat.country.replace(/"/g, '&quot;')}" style="cursor: pointer;">
                        <div class="dns-country-name">${countryStat.country}</div>
                        <div class="dns-country-count">${countryStat.domainCount} domain${countryStat.domainCount !== 1 ? 's' : ''}</div>
                        <div class="dns-country-percentage">${percentage}%</div>
                    </div>
                `;
            });
            
            // Add "Show All" button
            html += `
                <div class="dns-country-card dns-country-card-all" data-filter-country="all" style="cursor: pointer; border: 2px solid rgba(217, 53, 62, 0.3);">
                    <div class="dns-country-name">Show All</div>
                    <div class="dns-country-count">${data.total} domain${data.total !== 1 ? 's' : ''}</div>
                    <div class="dns-country-percentage">100%</div>
                </div>
            `;
            
            html += '</div></div>';
        }
        
        // Sort by domain name
        domains.sort((a, b) => a.domain.localeCompare(b.domain));
        
        html += '<div class="dns-history-list" id="dns-history-list">';
        
        domains.forEach(domainData => {
            const domain = domainData.domain;
            const ips = domainData.historical_ips || [];
            
            if (ips.length === 0) return;
            
            // Group IPs by location (country) - use same normalization function
            const locationGroups = {};
            ips.forEach(ipRecord => {
                const normalizedCountry = window.normalizeCountryName(
                    ipRecord.country,
                    ipRecord.location
                );
                
                if (!locationGroups[normalizedCountry]) {
                    locationGroups[normalizedCountry] = {
                        country: normalizedCountry,
                        location: ipRecord.location || normalizedCountry,
                        asn: ipRecord.asn || 'Unknown',
                        ips: [],
                        dates: []
                    };
                }
                
                // Only add unique IPs
                if (!locationGroups[normalizedCountry].ips.includes(ipRecord.ip)) {
                    locationGroups[normalizedCountry].ips.push(ipRecord.ip);
                }
                
                // Track dates
                if (ipRecord.last_seen) {
                    locationGroups[normalizedCountry].dates.push(ipRecord.last_seen);
                }
            });
            
            // Calculate total unique IPs
            const totalUniqueIPs = new Set(ips.map(ip => ip.ip)).size;
            
            html += `
                <div class="dns-domain-card" data-domain="${domain.toLowerCase()}">
                    <div class="dns-domain-header">
                        <h3>${domain}</h3>
                        <span class="dns-ip-count">${totalUniqueIPs} unique IP${totalUniqueIPs !== 1 ? 's' : ''} across ${Object.keys(locationGroups).length} location${Object.keys(locationGroups).length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="dns-ips-list">
            `;
            
            // Sort locations by IP count (most IPs first)
            const sortedLocations = Object.values(locationGroups).sort((a, b) => b.ips.length - a.ips.length);
            
            sortedLocations.forEach(locGroup => {
                // Sort IPs for display
                locGroup.ips.sort();
                
                // Get date range
                const dates = locGroup.dates.filter(d => d).sort();
                const dateRange = dates.length > 0 ? 
                    (dates.length === 1 ? dates[0] : `${dates[dates.length - 1]} to ${dates[0]}`) : 
                    'Unknown';
                
                // Format IP range (show first 3, then "and X more" if needed)
                let ipDisplay = '';
                if (locGroup.ips.length <= 5) {
                    ipDisplay = locGroup.ips.map(ip => `<code>${ip}</code>`).join(', ');
                } else {
                    const firstThree = locGroup.ips.slice(0, 3).map(ip => `<code>${ip}</code>`).join(', ');
                    const remaining = locGroup.ips.length - 3;
                    ipDisplay = `${firstThree} and ${remaining} more`;
                }
                
                html += `
                    <div class="dns-location-group">
                        <div class="dns-location-header">
                            <strong>${locGroup.country}</strong>
                            <span class="dns-location-count">${locGroup.ips.length} IP${locGroup.ips.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="dns-location-details">
                            <div class="dns-location-info">
                                <span class="dns-info-label">Location:</span> ${locGroup.location}
                            </div>
                            <div class="dns-location-info">
                                <span class="dns-info-label">ASN:</span> ${locGroup.asn}
                            </div>
                            <div class="dns-location-info">
                                <span class="dns-info-label">IP Addresses:</span> ${ipDisplay}
                            </div>
                            <div class="dns-location-info">
                                <span class="dns-info-label">Date Range:</span> ${dateRange}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Store the list container reference
        const listContainer = container.querySelector('.dns-history-list');
        if (listContainer) {
            listContainer.id = 'dns-history-list';
        }
        
        // Add event delegation for country card clicks
        const summaryContainer = container.querySelector('.dns-country-summary');
        if (summaryContainer) {
            summaryContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.dns-country-card');
                if (card) {
                    const filterCountry = card.dataset.filterCountry;
                    if (filterCountry === 'all') {
                        window.filterDnsByCountry(null);
                    } else if (filterCountry) {
                        window.filterDnsByCountry(filterCountry);
                    }
                }
            });
        }
        
        // Add search functionality (only add listener once)
        if (searchInput && !searchInput.hasAttribute('data-listener-added')) {
            searchInput.setAttribute('data-listener-added', 'true');
            searchInput.addEventListener('input', () => {
                window.applyDnsFilters();
            });
        }
        
        // Initialize filter state
        window.dnsHistoryFilterCountry = null;
        
    } catch (error) {
        console.error("Error loading DNS history:", error);
        container.innerHTML = '<div class="error" style="padding: 20px; color: #f97373;">Error loading DNS history. Please try again.</div>';
    }
}

// Filter DNS history by country - make it globally accessible
window.filterDnsByCountry = function(country) {
    console.log('Filtering by country:', country);
    window.dnsHistoryFilterCountry = country;
    
    // Update card styles to show selected state
    const cards = document.querySelectorAll('.dns-country-card');
    cards.forEach(card => {
        card.classList.remove('dns-country-card-active');
        if (country && card.dataset.filterCountry === country) {
            card.classList.add('dns-country-card-active');
        } else if (!country && (card.dataset.filterCountry === 'all' || card.classList.contains('dns-country-card-all'))) {
            card.classList.add('dns-country-card-active');
        }
    });
    
    window.applyDnsFilters();
};

// Apply both country and search filters - make it globally accessible
window.applyDnsFilters = function() {
    const container = document.getElementById('dns-history-list');
    if (!container) {
        console.warn('DNS history list container not found');
        return;
    }
    
    const searchInput = document.getElementById('dns-search');
    const searchTerm = (searchInput ? searchInput.value.toLowerCase() : '');
    const countryFilter = window.dnsHistoryFilterCountry || null;
    
    const cards = container.querySelectorAll('.dns-domain-card');
    let visibleCount = 0;
    
    console.log('Applying filters:', { countryFilter, searchTerm, totalCards: cards.length });
    
    cards.forEach(card => {
        const domain = card.dataset.domain;
        const domainData = window.dnsHistoryDomains ? window.dnsHistoryDomains.find(d => d.domain.toLowerCase() === domain) : null;
        
        // Check search filter
        let matchesSearch = !searchTerm || domain.includes(searchTerm);
        
        // Check country filter
        let matchesCountry = true;
        if (countryFilter && domainData && domainData.historical_ips) {
            matchesCountry = false;
            domainData.historical_ips.forEach(ipRecord => {
                const normalizedCountry = window.normalizeCountryName(
                    ipRecord.country,
                    ipRecord.location
                );
                if (normalizedCountry === countryFilter) {
                    matchesCountry = true;
                }
            });
        }
        
        if (matchesSearch && matchesCountry) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log('Filter applied:', { visibleCount, totalCards: cards.length });
    
    // Update stats
    const statsContainer = document.getElementById('dns-stats');
    if (statsContainer) {
        const total = window.dnsHistoryDomains ? window.dnsHistoryDomains.length : 0;
        let statsHtml = `
            <strong>Total:</strong> ${total} domains | 
            <strong>Showing:</strong> ${visibleCount} domain${visibleCount !== 1 ? 's' : ''}
        `;
        if (countryFilter) {
            statsHtml += ` | <strong>Filtered by:</strong> ${countryFilter}`;
        }
        statsContainer.innerHTML = statsHtml;
    }
};

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
        // Add cache-busting query parameter
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/shadowstack/api/domains?t=${cacheBuster}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
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
            '<tr><td colspan="24" class="loading">Error loading data</td></tr>';
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
    
    // Hide "Show All Columns" button since empty columns are removed
    const showAllBtn = document.getElementById("show-all-btn");
    if (showAllBtn) {
        showAllBtn.style.display = "none";
    }
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
        tbody.innerHTML = '<tr><td colspan="24" class="loading">No domains found</td></tr>';
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
        
        // Extract SecurityTrails data
        let subdomains = [];
        let subdomainCount = 0;
        let historicalIPs = [];
        let historicalIPCount = 0;
        
        try {
            if (domain.dns_records) {
                const dns = typeof domain.dns_records === 'string' ? JSON.parse(domain.dns_records) : domain.dns_records;
                if (dns && dns.securitytrails) {
                    const st = dns.securitytrails;
                    // Check if available (some domains might have empty securitytrails object)
                    // If available is explicitly false, skip. Otherwise, try to extract data.
                    if (st && st.available !== false) {
                        // Subdomains
                        if (st.subdomains && Array.isArray(st.subdomains)) {
                            if (st.subdomains.length > 0) {
                                subdomains = st.subdomains;
                                subdomainCount = st.subdomain_count || subdomains.length;
                            } else if (st.subdomain_count && parseInt(st.subdomain_count) > 0) {
                                subdomainCount = parseInt(st.subdomain_count);
                            }
                        } else if (st.subdomain_count && parseInt(st.subdomain_count) > 0) {
                            subdomainCount = parseInt(st.subdomain_count);
                        }
                        // Historical DNS
                        if (st.historical_dns && Array.isArray(st.historical_dns)) {
                            if (st.historical_dns.length > 0) {
                                historicalIPs = st.historical_dns;
                                historicalIPCount = historicalIPs.length;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Error extracting SecurityTrails data:', e, domain.domain);
        }
        
        // Extract WhoisXML enhanced registrar
        let enhancedRegistrar = '';
        try {
            if (domain.whois_data) {
                const whois = typeof domain.whois_data === 'string' ? JSON.parse(domain.whois_data) : domain.whois_data;
                if (whois && whois.whoisxml) {
                    const wx = whois.whoisxml;
                    // Check if available - if available is explicitly false, skip. Otherwise, try to extract.
                    if (wx && wx.available !== false && wx.whois_data) {
                        enhancedRegistrar = wx.whois_data.registrar || '';
                    }
                }
            }
        } catch (e) {
            console.warn('Error extracting WhoisXML data:', e, domain.domain);
        }
        
        // Build row cells in header order
        const cellMap = {
            'row-number': `<td class="row-number">${index + 1}</td>`,
            'domain': `<td class="col-domain"><strong>${escapeHtml(domain.domain || 'N/A')}</strong></td>`,
            'isp': `<td class="col-isp" title="${escapeHtml(domain.isp || '')}">${domain.isp ? escapeHtml(domain.isp.substring(0, 30)) : '<span class="empty">—</span>'}</td>`,
            'host_name': `<td class="col-host" title="${escapeHtml(domain.host_name || '')}">${domain.host_name ? escapeHtml(domain.host_name.substring(0, 25)) : '<span class="empty">—</span>'}</td>`,
            'cms': `<td class="col-cms">${domain.cms ? escapeHtml(domain.cms) : '<span class="empty">—</span>'}</td>`,
            'cdn': `<td class="col-cdn">${domain.cdn ? escapeHtml(domain.cdn) : '<span class="empty">—</span>'}</td>`,
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
            // Removed empty columns: subdomains, historical_ips, enhanced_registrar (no data available)
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
        let aVal, bVal;
        
        // Removed special handling for empty columns: subdomains, historical_ips, enhanced_registrar
        aVal = String(a[column] || '').toLowerCase();
        bVal = String(b[column] || '').toLowerCase();
        
        {
            // String comparison for other columns
            if (currentSort.direction === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
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
    
    // Pre-calculate connection counts for service nodes to size them properly
    const nodeConnectionCounts = new Map();
    graphData.edges.forEach(edge => {
        const sourceId = String(edge.source?.id || edge.source);
        const targetId = String(edge.target?.id || edge.target);
        nodeConnectionCounts.set(sourceId, (nodeConnectionCounts.get(sourceId) || 0) + 1);
        nodeConnectionCounts.set(targetId, (nodeConnectionCounts.get(targetId) || 0) + 1);
    });
    
    // Store connection counts on nodes for getNodeSize to use
    graphData.nodes.forEach(node => {
        node._connectionCount = nodeConnectionCounts.get(String(node.id)) || 0;
    });
    
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
            return nodeType === "domain" ? 2 : 3;  // Thicker stroke for service nodes
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
            return nodeType === "domain" ? "12px" : "13px";  // Slightly larger for better readability
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
    
    // Create link force with increased spacing
    const linkForce = d3.forceLink(graphData.edges)
        .id(d => String(d.id))
        .distance(d => {
            // Increased distances for better spacing
            const sourceType = d.source.node_type || (d.source.label?.toLowerCase() === "domain" ? "domain" : "service");
            const targetType = d.target.node_type || (d.target.label?.toLowerCase() === "domain" ? "domain" : "service");
            
            // If connecting domain to service, give more space
            if ((sourceType === "domain" && targetType === "service") || 
                (sourceType === "service" && targetType === "domain")) {
                return 150;  // More space around services
            }
            return 200;  // More space for other connections
        })
        .strength(0.3);  // Weaker links for better spacing
    
    simulation = d3.forceSimulation(graphData.nodes)
        .force("link", linkForce)
        .force("charge", d3.forceManyBody().strength(d => {
            // Increased repulsion to spread nodes out more
            const nodeType = d.node_type || (d.label?.toLowerCase() === "domain" ? "domain" : "service");
            if (nodeType === "service") {
                return -2000;  // Stronger repulsion for service nodes
            }
            return -800;  // More repulsion for domains
        }))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => getNodeSize(d) + 40))  // Much more space around nodes
        .alpha(1)
        .alphaDecay(0.01)  // Slower decay for better layout
        .velocityDecay(0.4);  // More damping for stability
    
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
            .attr("y", d => d.y + getNodeSize(d) + 18);  // More space below node for label
        
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

// Get node size based on type and usage
function getNodeSize(node) {
    const nodeType = node.node_type || node.label?.toLowerCase();
    const isDomain = nodeType === "domain";
    
    // Domains are medium-sized
    if (isDomain) {
        return 8;  // Smaller domains so services stand out as hubs
    }
    
    // Services should be larger and scale by usage
    const labelLower = node.label?.toLowerCase() || "";
    
    // Use pre-calculated connection count if available
    const connectionCount = node._connectionCount || 0;
    
    // Base sizes for service types
    const baseSizes = {
        "host": 20,
        "cdn": 18,
        "cms": 12,
        "registrar": 16,
        "paymentprocessor": 12,
        "payment": 12
    };
    
    const baseSize = baseSizes[labelLower] || 15;
    
    // Scale up based on connections (more domains = bigger node)
    // Cloudflare with 60+ connections will be ~40px, creating a clear hub
    if (connectionCount > 0) {
        // Scale: base size + (connections * 1.2), capped at 45px for very popular services
        const scaledSize = Math.min(baseSize + (connectionCount * 1.2), 45);
        return Math.max(scaledSize, baseSize);  // At least base size
    }
    
    return baseSize;
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
                
                ${(() => {
                    // SecurityTrails data
                    const st = domainData.dns_records?.securitytrails;
                    if (!st || !st.available) return '';
                    
                    let stHtml = '<div class="modal-section"><h3>🔍 SecurityTrails Intelligence</h3>';
                    
                    // Subdomains
                    if (st.subdomains && st.subdomains.length > 0) {
                        stHtml += `<div class="info-row">
                            <span class="info-label">Subdomains (${st.subdomain_count || st.subdomains.length}):</span>
                            <span class="info-value">${escapeHtml(st.subdomains.slice(0, 10).join(', '))}${st.subdomains.length > 10 ? ` and ${st.subdomains.length - 10} more` : ''}</span>
                        </div>`;
                    }
                    
                    // Historical DNS
                    if (st.historical_dns && st.historical_dns.length > 0) {
                        stHtml += `<div class="info-row">
                            <span class="info-label">Historical IPs:</span>
                            <span class="info-value">${st.historical_dns.length} unique IP${st.historical_dns.length !== 1 ? 's' : ''} (${st.historical_dns.slice(0, 5).join(', ')}${st.historical_dns.length > 5 ? '...' : ''})</span>
                        </div>`;
                    }
                    
                    // Current DNS records
                    if (st.dns_records) {
                        const dns = st.dns_records;
                        if (dns.a && dns.a.length > 0) {
                            stHtml += `<div class="info-row">
                                <span class="info-label">A Records:</span>
                                <span class="info-value">${escapeHtml(dns.a.join(', '))}</span>
                            </div>`;
                        }
                        if (dns.ns && dns.ns.length > 0) {
                            stHtml += `<div class="info-row">
                                <span class="info-label">Name Servers:</span>
                                <span class="info-value">${escapeHtml(dns.ns.join(', '))}</span>
                            </div>`;
                        }
                    }
                    
                    // Tags
                    if (st.tags && st.tags.length > 0) {
                        stHtml += `<div class="info-row">
                            <span class="info-label">Security Tags:</span>
                            <span class="info-value">${escapeHtml(st.tags.join(', '))}</span>
                        </div>`;
                    }
                    
                    stHtml += '</div>';
                    return stHtml;
                })()}
                
                ${(() => {
                    // WhoisXML data
                    const wx = domainData.whois_data?.whoisxml;
                    if (!wx || !wx.available) return '';
                    
                    let wxHtml = '<div class="modal-section"><h3>📋 Enhanced WHOIS (WhoisXML)</h3>';
                    const whois = wx.whois_data || {};
                    
                    // Enhanced registrar info
                    if (whois.registrar) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Registrar:</span>
                            <span class="info-value">${escapeHtml(whois.registrar)}</span>
                        </div>`;
                    }
                    
                    // Registrant details
                    if (whois.registrant_name || whois.registrant_organization) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Registrant:</span>
                            <span class="info-value">${escapeHtml(whois.registrant_name || '')} ${whois.registrant_organization ? `(${whois.registrant_organization})` : ''}</span>
                        </div>`;
                    }
                    
                    if (whois.registrant_country) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Registrant Country:</span>
                            <span class="info-value">${escapeHtml(whois.registrant_country)}</span>
                        </div>`;
                    }
                    
                    // Dates
                    if (whois.creation_date) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Created:</span>
                            <span class="info-value">${formatDateForModal(whois.creation_date)}</span>
                        </div>`;
                    }
                    if (whois.updated_date) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Last Updated:</span>
                            <span class="info-value">${formatDateForModal(whois.updated_date)}</span>
                        </div>`;
                    }
                    if (whois.expiration_date) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Expires:</span>
                            <span class="info-value">${formatDateForModal(whois.expiration_date)}</span>
                        </div>`;
                    }
                    
                    // WHOIS History
                    if (wx.history && wx.history.length > 0) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">WHOIS History:</span>
                            <span class="info-value">${wx.history.length} record${wx.history.length !== 1 ? 's' : ''} available</span>
                        </div>`;
                    }
                    
                    // SSL Certificates
                    if (wx.ssl_certificates && wx.ssl_certificates.length > 0) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">SSL Certificates:</span>
                            <span class="info-value">${wx.ssl_certificates.length} certificate${wx.ssl_certificates.length !== 1 ? 's' : ''} found</span>
                        </div>`;
                    }
                    
                    // Related domains (reverse WHOIS)
                    if (wx.registrant_domains && wx.registrant_domains.length > 0) {
                        wxHtml += `<div class="info-row">
                            <span class="info-label">Related Domains (same registrant):</span>
                            <span class="info-value">${wx.registrant_domains.length} domain${wx.registrant_domains.length !== 1 ? 's' : ''} found</span>
                        </div>`;
                    }
                    
                    wxHtml += '</div>';
                    return wxHtml;
                })()}
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
