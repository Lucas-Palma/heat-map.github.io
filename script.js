const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

//colors
const colors = ["#ffff00", "#ffb700", "#ff7b00", "#ff3700", "#ea0000", "#970000", "#5b0000", "#250000", "#000000"]
    
//data fetching
d3.json(url)
    .then(data => callback(data))
    .catch(err => console.log(err));

const callback = (data) => {
    data.monthlyVariance.forEach(d => {
    d.month -= 1;
    });

//section and heading
let section = d3.select('body').append('section');

let heading = section.append('heading');
  heading
      .append('h1')
      .attr('id', 'title')
      .text('Monthly Global Land-Surface Temperature');
  heading
      .append('h3')
      .attr('id', 'description')
      .html('1753 - 2015: base temperature 8.66℃');

let width = 1000
let height = 300
let padding = 200;

//create tip
let tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .attr('id', 'tooltip')
    .html(d => {
        return d;
    })
    .direction('e')
    .offset([0, 5]);

//create svg
let svg = section
    .append('svg')
    .attr('width', width + padding * 2)
    .attr('height', height + padding * 2)
    .call(tip)

//yAxis
let yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .rangeRound([0, height])

let yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickValues(yScale.domain())
    .tickFormat(month => {
        let date = new Date(0);
        date.setUTCMonth(month);
        let format = d3.timeFormat('%B');
        return format(date);
    });

svg 
    .append('g')
    .classed('y-axis', true)
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding - 1}, 0)`) 
    .call(yAxis)
    .append('text')
    .text('Months')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .attr(
        'transform',
        `translate(${- 60}, ${height / 2 }) rotate(-90)`
      )
      .attr('fill', 'black');

//xAxis
let xScale = d3
    .scaleBand()
    .domain(
        data.monthlyVariance.map(val => {
            return val.year;
        })
    )
    .range([0, width]);

let xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickValues(
        xScale.domain().filter(year => {
            return year % 10 === 0;
        })
    )
    .tickFormat(year => {
        let date = new Date(0);
        date.setUTCFullYear(year);
        let format = d3.timeFormat('%Y');
        return format(date);
    })
    
svg
    .append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(${padding}, ${height})`)
    .call(xAxis)
    .append('text')
    .text('Years')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .attr('transform', `translate(${width / 2}, ${30})`)
    .attr('fill', 'black');

    //legend
    let legendWidth = 200;
    let legendHeight = 20 ;
  
    let legendThreshold = d3
      .scaleThreshold()
      .domain([2, 5, 6, 7, 8, 9, 10, 11, 14])
      .range(colors);
  
    let legendX = d3
      .scaleLinear()
      .domain([2, 14])
      .range([0, legendWidth]);
  
    let legendXAxis = d3
      .axisBottom()
      .scale(legendX)
      .tickSize(15, 0)
      .tickValues(legendThreshold.domain())
  
    let legend = svg
    .append('g')
    .classed('legend', true)
    .attr('id', 'legend')
    .attr(
    'transform',
    `translate(${padding}, ${height + legendHeight * 2 })`
    );
  
    legend
      .append('g')
      .selectAll('rect')
      .data(
        legendThreshold.range().map(function (color) {
          let d = legendThreshold.invertExtent(color);
          if (d[0] === null) {
            d[0] = legendX.domain()[0];
          }
          if (d[1] === null) {
            d[1] = legendX.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append('rect')
      .style('fill', function (d) {
        return legendThreshold(d[0]);
      })
      .attr('x', d => legendX(d[0]))
      .attr('y', 0)
      .attr('width', d =>
      d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
    )
      .attr('height', legendHeight);

    legend
        .append('g')
        .attr('transform', `translate( 0, ${legendHeight})`)
        .call(legendXAxis);

    //map
    svg
      .append('g')
      .classed('map', true)
      .attr('transform', `translate( ${padding}, 0)`)
      .selectAll('rect')
      .data(data.monthlyVariance)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', (d) => {
        return d.month;
      })
      .attr('data-year', (d) => {
        return d.year;
      })
      .attr('data-temp', (d) => {
        return d.baseTemperature +  d.variance;
      })
      .attr('x', (d) => xScale(d.year + 1))
      .attr('y', (d) => yScale(d.month + 1))
      .attr('width', (d) => xScale.bandwidth(d.year))
      .attr('height', (d) => yScale.bandwidth(d.month))
      .attr('fill', function (d) {
        return legendThreshold(data.baseTemperature + d.variance);
      })
      .on('mouseover', function(event, d) {
        let date = new Date(d.year, d.month);
        let str =
            `<span class='date'> 
                ${d3.timeFormat('%Y - %B')(date)}
            </span>
            <br />
            <span class='temperature'>
              ${d3.format('.1f')(data.baseTemperature + d.variance)}&#8451
            </span>
            <br /> 
            <span class='variance'>
              ${d3.format('+.1f')(d.variance)}&#8451;
            </span>`
        tip.attr('data-year', d.year);
        tip.show(str, this);
      })
      .on('mouseout', tip.hide);
    }