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
    

    // Group data by Commodity_Description
    // Ensure data is properly grouped by Commodity_Description
    const groupedExports = d3.group(exportsData.filter(d => d.Commodity_Description), d => d.Commodity_Description);
    const groupedYield = d3.group(yieldData.filter(d => d.Commodity_Description), d => d.Commodity_Description);


    // Create a simple visualization for exports and yield
    const svgWidth = 800;
    const svgHeight = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    // const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const commodities = Array.from(groupedExports.keys());
    
    // Draw a wheat stalk visualization
    const stalkHeight = chartHeight * 0.7;
    const stalkWidth = 3;
    const leafWidth = 20;
    const leafHeight = 30;
    const leavesPerStalk = 10;

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

    // Draw the leaves on the sides
    const leafSpacing = stalkHeight / (leavesPerStalk * 1.3); // Reduce spacing between leaves

    for (let i = 0; i < leavesPerStalk; i++) {
        const leafY = i * leafSpacing; // Start from the top and move downward
        const leafOffsetX = stalkWidth; // Offset leaves to the sides of the stalk
        const rotationAngle = 140; // Rotate leaves slightly

        // Left side leaf
        wheatStalkGroup.append('path')
            .attr('d', `M${-leafOffsetX},${leafY} Q${-leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY + leafHeight} Q${-leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${-leafOffsetX},${leafY}`)
            .attr('fill', stalkColor)
            .attr('transform', `rotate(${-rotationAngle}, ${-leafOffsetX}, ${leafY})`);

        // Right side leaf
        wheatStalkGroup.append('path')
            .attr('d', `M${leafOffsetX},${leafY} Q${leafOffsetX + leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY + leafHeight} Q${leafOffsetX - leafWidth / 2},${leafY + leafHeight / 2} ${leafOffsetX},${leafY}`)
            .attr('fill', stalkColor)
            .attr('transform', `rotate(${rotationAngle}, ${leafOffsetX}, ${leafY})`);
    }
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

