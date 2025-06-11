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
    

    const year = '2023'; // Example year, can be parameterized later

    // Group data by Commodity_Description
    // Ensure data is properly grouped by Commodity_Description
    const groupedExports = d3.group(exportsData.filter(d => d.Commodity_Description), d => d.Commodity_Description);
    const groupedYield = d3.group(
        yieldData.filter(d => d.Commodity_Description && d.Calendar_Year === year),
        d => d.Commodity_Description
    );

    // Create a simple visualization for exports and yield
    const svgWidth = 800;
    const svgHeight = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
        // Define crop color mapping
        const cropColors = {
            'Wheat': '#FFD700',      // Golden/Yellow
            'Barley': '#D2B48C',     // Light Brown
            'Corn': '#FFA500',         // Orange
            'Millet': '#BDB76B',       // Dark Khaki
            'Oats': '#C0C0C0',         // Silver/Gray
            'Rye': '#8B4513',          // SaddleBrown
            'Rice, Milled': '#FFF8DC', // Cornsilk/Off-white
            'Sorghum': '#A0522D',      // Sienna
            // Add more crops and colors as needed
        };

        // Calculate total yield for each crop using groupedYield
        const cropYields = {};
        groupedYield.forEach((records, crop) => {
            // records is an array of yield records for this crop
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

        // Sort leaves by crop for grouping colors
        leaves = leaves.sort((a, b) => a.crop.localeCompare(b.crop));

        console.log('Leaves data:', leaves);

        // Wheat stalk parameters
        const stalkHeight = chartHeight * 0.7;
        const stalkWidth = 3;
        const stalkColor = '#FFD700';

        // Create a group for the wheat stalk
        const wheatStalkGroup = chart.append('g')
            .attr('transform', `translate(${chartWidth / 2}, ${chartHeight - stalkHeight})`);

        // Draw the stalk
        wheatStalkGroup.append('rect')
            .attr('x', -stalkWidth / 2)
            .attr('y', 0)
            .attr('width', stalkWidth)
            .attr('height', stalkHeight)
            .attr('fill', stalkColor);

        // Draw leaves (absolute, 1 per 1000 MT)
        const leafWidth = 20;
        const leafHeight = 30;
        const leavesPerStalk = leaves.length;
        const leafSpacing = stalkHeight / (leavesPerStalk * 1.3);
        const rotationAngle = 140;
        const leafOffsetX = stalkWidth;

        leaves.forEach((leaf, i) => {
            const leafY = i * leafSpacing;
            // Alternate left/right
            if (i % 2 === 0) {
                // Left side leaf
                wheatStalkGroup.append('path')
                    .attr('d', `M${-leafOffsetX},${leafY} Q${-leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY + leafHeight} Q${-leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY}`)
                    .attr('fill', cropColors[leaf.crop] || stalkColor)
                    .attr('transform', `rotate(${-rotationAngle}, ${-leafOffsetX}, ${leafY})`)
                    .append('title')
                    .text(leaf.crop);
            } else {
                // Right side leaf
                wheatStalkGroup.append('path')
                    .attr('d', `M${leafOffsetX},${leafY} Q${leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY + leafHeight} Q${leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY}`)
                    .attr('fill', cropColors[leaf.crop] || stalkColor)
                    .attr('transform', `rotate(${rotationAngle}, ${leafOffsetX}, ${leafY})`)
                    .append('title')
                    .text(leaf.crop);
            }
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

