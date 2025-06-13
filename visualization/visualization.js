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

        // Calculate total yield for each crop using groupedYield
        const cropYields = {};
        groupedYield.forEach((records, crop) => {
            const totalCropYield = d3.sum(records, d => +d.Value || 0);
            cropYields[crop] = totalCropYield;
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

        // Draw the stalk
        stalkGroup.append('rect')
            .attr('x', -stalkWidth / 2)
            .attr('y', 0)
            .attr('width', stalkWidth)
            .attr('height', stalkHeight)
            .attr('fill', stalkColor);

        // Draw leaves (absolute, 1 per 1000 MT)
        const leafWidth = 20;
        const leafHeight = 30;
        const leavesPerStalk = leaves.length;
        const leafSpacing = stalkHeight / (leavesPerStalk * 1.3 || 1);
        const rotationAngle = 140;
        const leafOffsetX = stalkWidth;

        leaves.forEach((leaf, i) => {
            const leafY = i * leafSpacing;
            if (i % 2 === 0) {
                stalkGroup.append('path')
                    .attr('d', `M${-leafOffsetX},${leafY} Q${-leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY + leafHeight} Q${-leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY}`)
                    .attr('fill', cropColors[leaf.crop] || stalkColor)
                    .attr('transform', `rotate(${-rotationAngle}, ${-leafOffsetX}, ${leafY})`)
                    .append('title')
                    .text(leaf.crop);
            } else {
                stalkGroup.append('path')
                    .attr('d', `M${leafOffsetX},${leafY} Q${leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY + leafHeight} Q${leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY}`)
                    .attr('fill', cropColors[leaf.crop] || stalkColor)
                    .attr('transform', `rotate(${rotationAngle}, ${leafOffsetX}, ${leafY})`)
                    .append('title')
                    .text(leaf.crop);
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

