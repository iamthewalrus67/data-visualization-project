// Boilerplate JavaScript code for visualization.js

// Load CSV data from the data folder using D3.js
const csvFiles = [
    '../data/exports_data.csv',
    '../data/yield_data.csv'
];

// Example function to create a basic visualization using D3.js
function createVisualization(exportsData, yieldData) {
    const container = d3.select('#visualization-container');
    if (container.empty()) {
        console.error('Visualization container not found.');
        return;
    }
    

    // Draw stalks for years 2015 to 2025
    const years = d3.range(2015, 2026);
    const svgWidth = 80 * years.length + 100;
    const svgHeight = 700;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Clear previous SVG if any
    container.selectAll('svg').remove();
    container.selectAll('.crop-legend').remove();

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);
        // .style('background', 'rgba(247, 242, 171, 0.95)')
        // .style('border', '1px solid #ccc')
        // .style('border-radius', '8px')
        // .style('padding', '10px')
        // .style('box-shadow', '0 2px 8px rgba(0,0,0,0.07)');

    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Tooltip div
    let tooltip = d3.select('body').select('.stalk-tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body')
            .append('div')
            .attr('class', 'stalk-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(255, 252, 214, 0.95)')
            .style('border', '1px solid #ccc')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('font-family', 'Arial, sans-serif')
            .style('color', '#222')
            .style('display', 'none')
            .style('z-index', 1000);
    }

    // Crop color mapping
    const cropColors = {
        'Wheat': '#FFD700',
        'Barley': '#D2B48C',
        'Corn': '#FFA500',
        'Millet': '#BDB76B',
        'Oats': '#C0C0C0',
        'Rye': '#8B4513',
        'Rice, Milled': '#FFF8DC',
        'Sorghum': '#A0522D',
        // Add more crops and colors as needed
    };

    // --- Add Crop Legend ---
    // Get all crops present in the data
    const allCropsSet = new Set();
    exportsData.forEach(d => {
        if (d.Commodity_Description) allCropsSet.add(d.Commodity_Description);
    });
    yieldData.forEach(d => {
        if (d.Commodity_Description) allCropsSet.add(d.Commodity_Description);
    });
    const allCrops = Array.from(allCropsSet).sort();

    // Legend container (as a div for easier styling)
    const legend = container.append('div')
        .attr('class', 'crop-legend')
        .style('position', 'absolute')
        .style('top', `${svgHeight + 200}px`)
        // .style('left', `${svgWidth}px`)
        .style('background', 'rgba(255, 252, 214, 0.95)')
        .style('border', '1px solid #ccc')
        .style('border-radius', '8px')
        .style('padding', '12px 18px 12px 14px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.07)')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '15px')
        .style('z-index', 10)
        .style('cursor', 'move');

    // --- Legend Dragging ---
    let dragOffset = { x: 0, y: 0 };
    let isDragging = false;

    legend.on('mousedown', function(event) {
        // Only drag if not clicking the minimize button
        if (event.target.classList.contains('legend-min-btn')) return;
        isDragging = true;
        const rect = legend.node().getBoundingClientRect();
        dragOffset.x = event.clientX - rect.left;
        dragOffset.y = event.clientY - rect.top;
        d3.select(window)
            .on('mousemove.legenddrag', function(event) {
                if (isDragging) {
                    legend.style('left', (event.clientX - dragOffset.x) + 'px')
                          .style('top', (event.clientY - dragOffset.y) + 'px');
                }
            })
            .on('mouseup.legenddrag', function() {
                isDragging = false;
                d3.select(window).on('mousemove.legenddrag', null).on('mouseup.legenddrag', null);
            });
        event.preventDefault();
    });

    // --- Minimize Button ---
    const legendHeader = legend.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'space-between')
        .style('margin-bottom', '8px');

    legendHeader.append('span')
        .style('font-weight', 'bold')
        .text('Crop Legend');

    legendHeader.append('button')
        .attr('class', 'legend-min-btn')
        .attr('title', 'Minimize legend')
        .style('margin-left', '10px')
        .style('background', 'none')
        .style('border', 'none')
        .style('font-size', '18px')
        .style('cursor', 'pointer')
        .style('color', '#888')
        .html('-') // en dash as minimize icon
        .on('click', function(event) {
            event.stopPropagation();
            const isMin = legend.classed('minimized');
            if (!isMin) {
                legend.classed('minimized', true);
                legendList.style('display', 'none');
                d3.select(this).html('+').attr('title', 'Restore legend'); // open square
            } else {
                legend.classed('minimized', false);
                legendList.style('display', null);
                d3.select(this).html('-').attr('title', 'Minimize legend');
            }
        });

    const legendList = legend.append('ul')
        .style('list-style', 'none')
        .style('margin', 0)
        .style('padding', 0);

    allCrops.forEach(crop => {
        const color = cropColors[crop] || '#888';
        const item = legendList.append('li')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('margin-bottom', '5px');
        item.append('span')
            .style('display', 'inline-block')
            .style('width', '18px')
            .style('height', '18px')
            .style('margin-right', '8px')
            .style('border-radius', '4px')
            .style('background', color)
            .style('border', '1px solid #bbb');
        item.append('span')
            .text(crop);
    });
    // --- End Crop Legend ---

    // Find max exports for scaling
    let maxExports = 0;
    years.forEach(year => {
        const groupedExports = d3.group(
            exportsData.filter(d => d.Commodity_Description && d.Calendar_Year === String(year)),
            d => d.Commodity_Description
        );
        const totalExports = d3.sum(
            Array.from(groupedExports.values()).flat(),
            d => +d.Value || 0
        );
        if (totalExports > maxExports) maxExports = totalExports;
    });
    maxExports = Math.max(maxExports, 10000); // Avoid division by zero

    // Helper to show tooltip
    function showTooltip(event, year, totalYield, totalExports, cropYields, cropExports, cropFilter) {
        let html = `<strong>Year:</strong> ${year}<br>`;
        if (cropFilter) {
            html += `<strong>Crop:</strong> <span style="color:${cropColors[cropFilter] || '#888'}">${cropFilter}</span><br>`;
            html += `<strong>Yield (MT/HA):</strong> ${d3.format('.2f')(cropYields[cropFilter] || 0)}<br>`;
            html += `<strong>Exports (1000 MT):</strong> ${d3.format(',')(cropExports[cropFilter] || 0)}<br>`;
        } else {
            html += `<strong>Total Yield (MT/HA) (avg):</strong> ${d3.format('.2f')(totalYield)}<br>`;
            html += `<strong>Total Exports (1000 MT):</strong> ${d3.format(',')(totalExports)}<br>`;
            html += `<strong>Crop Yields (MT/HA):</strong><ul style="margin:0 0 0 18px;padding:0">`;
            Object.entries(cropYields).forEach(([crop, val]) => {
                html += `<li><span style="color:${cropColors[crop] || '#888'}">&#9632;</span> ${crop}: ${d3.format('.2f')(val)}</li>`;
            });
            html += `</ul>`;
            html += `<strong>Crop Exports (1000 MT):</strong><ul style="margin:0 0 0 18px;padding:0">`;
            Object.entries(cropExports).forEach(([crop, val]) => {
                html += `<li><span style="color:${cropColors[crop] || '#888'}">&#9632;</span> ${crop}: ${d3.format(',')(val)}</li>`;
            });
            html += `</ul>`;
        }
        tooltip.html(html)
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 20) + 'px');
    }

    function hideTooltip() {
        tooltip.style('display', 'none');
    }

    // Track selected crop group for toggling
    let selectedLeafGroup = null;
    let selectedCrop = null;

    years.forEach((year, idx) => {
        // Group data by Commodity_Description for this year
        const groupedExports = d3.group(
            exportsData.filter(d => d.Commodity_Description && d.Calendar_Year === String(year)),
            d => d.Commodity_Description
        );
        const groupedYield = d3.group(
            yieldData.filter(d => d.Commodity_Description && d.Calendar_Year === String(year)),
            d => d.Commodity_Description
        );

        // Calculate total exports for the year (unit: 1000 MT)
        const totalExports = d3.sum(
            Array.from(groupedExports.values()).flat(),
            d => +d.Value || 0
        );

        // Calculate average yield for the year (unit: MT/HA)
        let yieldVals = [];
        groupedYield.forEach((records, crop) => {
            records.forEach(d => {
                if (+d.Value) yieldVals.push(+d.Value);
            });
        });
        const totalYield = yieldVals.length ? d3.mean(yieldVals) : 0;

        // Calculate average yield for each crop using groupedYield
        const cropYields = {};
        groupedYield.forEach((records, crop) => {
            const avgCropYield = d3.mean(records, d => +d.Value || 0);
            cropYields[crop] = avgCropYield || 0;
        });

        // Calculate total exports for each crop using groupedExports
        const cropExports = {};
        groupedExports.forEach((records, crop) => {
            const totalCropExport = d3.sum(records, d => +d.Value || 0);
            cropExports[crop] = totalCropExport;
        });

        // Prepare leaves data array based on yield value (1 leaf per 1 MT/HA, rounded down)
        let leaves = [];
        Object.entries(cropYields).forEach(([crop, yieldVal]) => {
            const count = Math.floor(yieldVal); // 1 leaf per 1 MT/HA
            for (let i = 0; i < count; i++) {
                leaves.push({ crop });
            }
        });
        leaves = leaves.sort((a, b) => a.crop.localeCompare(b.crop));

        // Stalk height is proportional to total exports (max chartHeight)
        const stalkHeight = Math.max(40, Math.min(chartHeight * (totalExports / maxExports), chartHeight));
        const stalkWidth = 3;
        const stalkColor = '#FFD700';

        // X position for this stalk
        const x = idx * 80 + 40;

        // Create a group for the stalk
        const stalkGroup = chart.append('g')
            .attr('transform', `translate(${x}, ${chartHeight - stalkHeight})`);

        // Draw the stalk (add mouse events for tooltip)
        stalkGroup.append('rect')
            .attr('x', -stalkWidth / 2)
            .attr('y', 0)
            .attr('width', stalkWidth)
            .attr('height', stalkHeight)
            .attr('fill', stalkColor)
            .on('mouseover', function (event) {
                if (!selectedLeafGroup) {
                    showTooltip(event, year, totalYield, totalExports, cropYields, cropExports);
                }
            })
            .on('mousemove', function (event) {
                if (!selectedLeafGroup) {
                    tooltip
                        .style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                }
            })
            .on('mouseleave', function () {
                if (!selectedLeafGroup) {
                    hideTooltip();
                }
            });

        // Draw leaves (absolute, 1 per 1 MT/HA)
        const leafWidth = 20;
        const leafHeight = 30;
        const leavesPerStalk = leaves.length;
        const leafSpacing = stalkHeight / (leavesPerStalk * 1.3 || 1);
        const rotationAngle = 140;
        const leafOffsetX = stalkWidth;

        // Group leaves by crop for group selection
        const leavesByCrop = d3.groups(leaves, d => d.crop);

        leavesByCrop.forEach(([crop, cropLeaves]) => {
            // Create a group for each crop's leaves
            const cropLeafGroup = stalkGroup.append('g')
                .attr('class', 'crop-leaf-group')
                .attr('data-crop', crop);

            cropLeaves.forEach((leaf, i) => {
                // Find the index of this leaf in the full leaves array
                const globalIndex = leaves.findIndex((l, idx) => l.crop === crop && leaves.slice(0, idx).filter(x => x.crop === crop).length === i);
                const leafY = globalIndex * leafSpacing;
                let leafPath;
                if (globalIndex % 2 === 0) {
                    leafPath = cropLeafGroup.append('path')
                        .attr('d', `M${-leafOffsetX},${leafY} Q${-leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY + leafHeight} Q${-leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY}`)
                        .attr('fill', cropColors[leaf.crop] || stalkColor)
                        .attr('transform', `rotate(${-rotationAngle}, ${-leafOffsetX}, ${leafY})`);
                } else {
                    leafPath = cropLeafGroup.append('path')
                        .attr('d', `M${leafOffsetX},${leafY} Q${leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY + leafHeight} Q${leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY}`)
                        .attr('fill', cropColors[leaf.crop] || stalkColor)
                        .attr('transform', `rotate(${rotationAngle}, ${leafOffsetX}, ${leafY})`);
                }
                leafPath.append('title').text(leaf.crop);
            });

            // Add tooltip and click events to the group
            cropLeafGroup
                .on('mouseover', function (event) {
                    if (!selectedLeafGroup) {
                        // Show total stalk info when hovering over a leaf and nothing is selected
                        showTooltip(event, year, totalYield, totalExports, cropYields, cropExports);
                    } else if (selectedLeafGroup === this) {
                        // Show crop info if this group is selected
                        showTooltip(event, year, totalYield, totalExports, cropYields, cropExports, crop);
                    }
                })
                .on('mousemove', function (event) {
                    tooltip
                        .style('left', (event.pageX + 15) + 'px')
                        .style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseleave', function () {
                    if (!selectedLeafGroup) {
                        hideTooltip();
                    }
                })
                .on('click', function (event) {
                    event.stopPropagation();
                    if (selectedLeafGroup === this) {
                        // Deselect
                        selectedLeafGroup = null;
                        selectedCrop = null;
                        hideTooltip();
                        d3.select(this).selectAll('path')
                            .attr('stroke', null)
                            .attr('stroke-width', null);
                    } else {
                        // Deselect previous
                        if (selectedLeafGroup) {
                            d3.select(selectedLeafGroup).selectAll('path')
                                .attr('stroke', null)
                                .attr('stroke-width', null);
                        }
                        selectedLeafGroup = this;
                        selectedCrop = crop;
                        d3.selectAll('.crop-leaf-group').selectAll('path')
                            .attr('stroke', null)
                            .attr('stroke-width', null);
                        d3.select(this).selectAll('path')
                            .attr('stroke', '#222')
                            .attr('stroke-width', 2);
                        showTooltip(event, year, totalYield, totalExports, cropYields, cropExports, crop);
                    }
                });
        });

        // Deselect on background click
        svg.on('click', function () {
            if (selectedLeafGroup) {
                d3.select(selectedLeafGroup).selectAll('path')
                    .attr('stroke', null)
                    .attr('stroke-width', null);
                selectedLeafGroup = null;
                selectedCrop = null;
                hideTooltip();
            }
        });

        // Year label
        chart.append('text')
            .attr('x', x)
            .attr('y', chartHeight + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('font-family', 'Segoe UI, Arial, sans-serif')
            .text(year);
    });
}



// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {

    console.log('Visualization script loaded.');

    let exportsData = [];
    let yieldData = [];

    Promise.all(csvFiles.map(file => d3.csv(file)))
        .then(([loadedExportsData, loadedYieldData]) => {
            exportsData = loadedExportsData;
            yieldData = loadedYieldData;
            // console.log('Exports Data:', exportsData);
            // console.log('Yield Data:', yieldData);
            // Data is now loaded into variables for later use in visualizations

            // Initialize visualization
            createVisualization(exportsData, yieldData);
        })
        .catch(error => {
            console.error('Error loading CSV data:', error);
        });


}); // DOMContentLoaded

