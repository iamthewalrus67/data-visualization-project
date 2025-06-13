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
    const svgHeight = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Clear previous SVG if any
    container.selectAll('svg').remove();

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

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
            .style('background', 'rgba(255,255,255,0.95)')
            .style('border', '1px solid #ccc')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
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
            html += `<strong>Yield:</strong> ${d3.format(',')(cropYields[cropFilter] || 0)} (1000 MT)<br>`;
            html += `<strong>Exports:</strong> ${d3.format(',')(cropExports[cropFilter] || 0)} (1000 MT)<br>`;
        } else {
            html += `<strong>Total Yield:</strong> ${d3.format(',')(totalYield)} (1000 MT)<br>`;
            html += `<strong>Total Exports:</strong> ${d3.format(',')(totalExports)} (1000 MT)<br>`;
            html += `<strong>Crop Yields:</strong><ul style="margin:0 0 0 18px;padding:0">`;
            Object.entries(cropYields).forEach(([crop, val]) => {
                html += `<li><span style="color:${cropColors[crop] || '#888'}">&#9632;</span> ${crop}: ${d3.format(',')(val)} (1000 MT)</li>`;
            });
            html += `</ul>`;
            html += `<strong>Crop Exports:</strong><ul style="margin:0 0 0 18px;padding:0">`;
            Object.entries(cropExports).forEach(([crop, val]) => {
                html += `<li><span style="color:${cropColors[crop] || '#888'}">&#9632;</span> ${crop}: ${d3.format(',')(val)} (1000 MT)</li>`;
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

        // Calculate total yield for the year (unit: 1000 MT)
        const totalYield = d3.sum(
            Array.from(groupedYield.values()).flat(),
            d => +d.Value || 0
        );

        // Calculate total yield for each crop using groupedYield
        const cropYields = {};
        groupedYield.forEach((records, crop) => {
            const totalCropYield = d3.sum(records, d => +d.Value || 0);
            cropYields[crop] = totalCropYield;
        });

        // Calculate total exports for each crop using groupedExports
        const cropExports = {};
        groupedExports.forEach((records, crop) => {
            const totalCropExport = d3.sum(records, d => +d.Value || 0);
            cropExports[crop] = totalCropExport;
        });

        // Prepare leaves data array based on absolute yield value (1 leaf per 1000 MT)
        let leaves = [];
        Object.entries(cropYields).forEach(([crop, yieldVal]) => {
            const count = Math.floor(yieldVal); // 1 leaf per 1000 MT
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

        // Draw leaves (absolute, 1 per 1000 MT)
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

