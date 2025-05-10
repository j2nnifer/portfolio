import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
  }

function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: false,   // hides it from JSON.stringify or for...in
            writable: false,     // makes it read-only
            configurable: false  // prevents deletion or redefinition
        });
  
        return ret;
      });
  }

  function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Total lines of code
    dl.append('dt').html('Total Lines of Code');
    dl.append('dd').text(data.length);
  
    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Number of files
    const files = d3.groups(data, d => d.file);
    dl.append('dt').text('Number of files');
    dl.append('dd').text(files.length);
  
    // Average file length
    const avgFileLength = d3.mean(files, ([, lines]) => lines.length);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(avgFileLength.toFixed(2));
  
    // Maximum file length
    const maxFile = d3.max(files, ([, lines]) => lines.length);
    dl.append('dt').text('Max file length');
    dl.append('dd').text(maxFile);
  
    // Time of day most work is done
    const timeBins = d3.rollup(
      data,
      v => v.length,
      d => {
        const hour = d.datetime.getHours();
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
      }
    );
    const mostCommonTime = Array.from(timeBins.entries()).sort((a, b) => d3.descending(a[1], b[1]))[0][0];
  
    dl.append('dt').text('Most work done');
    dl.append('dd').text(mostCommonTime);
  }

  function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    // Ensure commits has datetime and hourFrac
    console.log('Commits for scatter plot:', commits);

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))  // Ensure commits have datetime field
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])  // 24-hour scale for hours
        .range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    // Bind the commits to the circles and set attributes
    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))  // Position by datetime
        .attr('cy', (d) => yScale(d.hourFrac))  // Position by hourFrac
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            console.log('Hovered Commit:', commit);  // Log commit data when hovering
        })
        .on('mouseleave', (event) => {
            console.log('Mouse leave event');  // Log when the mouse leaves
        });

    // Add x-axis (Time)
    const xAxis = d3.axisBottom(xScale).ticks(6);
    svg
        .append('g')
        .attr('transform', `translate(0, ${height - 30})`)
        .call(xAxis);

    // Add y-axis (Hour of Day)
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    svg
        .append('g')
        .attr('transform', 'translate(30, 0)')  // Position y-axis with a little margin
        .call(yAxis);
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

