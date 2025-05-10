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

  function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const countElement = document.querySelector("#selection-count");
    countElement.textContent = `${
      selectedCommits.length || "No"
    } commits selected`;
  
    return selectedCommits;
  }
  
  function createBrushSelector(svg) {
    svg.call(d3.brush().on("start brush end", brushed));
  
    svg.selectAll(".dots, .overlay ~ *").raise();
  }
  
  function brushed(event) {
    console.log(event);
    const selection = event.selection;
    d3.selectAll("circle").classed("selected", (d) =>
      isCommitSelected(selection, d)
    );
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
  }
  
  function isCommitSelected(selection, commit) {
    if (!selection) return false;
  
    const [x0, x1] = selection.map((d) => d[0]);
    const [y0, y1] = selection.map((d) => d[1]);
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
  
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  }
  
  function renderTooltipContent(commit) {
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", {
      dateStyle: "full",
    });
  }
  
  function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
  
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible"); // Keep this if you want effects like hover scale to be fully visible
  
    // Define margins and usable area FIRST
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  
    // Set up scales with the CORRECT ranges based on usableArea
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([usableArea.left, usableArea.right]) // Use usableArea range
      .nice();
  
    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]); // Use usableArea range (bottom to top for y-axis)
  
    const dots = svg.append("g").attr("class", "dots");
  
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    // Now draw the dots using the correctly defined scales
    dots
      .selectAll("circle")
      .data(sortedCommits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("fill", "steelblue")
      .attr("r", (d) => rScale(d.totalLines))
      .style("fill-opacity", 0.7)
      .on("mouseenter", (event, commit) => {
        // 1. Clear any existing timeout to prevent premature hiding
        clearTimeout(hideTooltipTimeout);
  
        // 2. Highlight the dot and show/update tooltip content
        d3.select(event.currentTarget).style("fill-opacity", 1);
        renderTooltipContent(commit);
        updateTooltipVisibility(true); // Show the tooltip
        updateTooltipPosition(event);
      })
      .on("mouseleave", (event) => {
        // 1. Unhighlight the dot
        d3.select(event.currentTarget).style("fill-opacity", 0.7);
  
        // 2. Set a timeout to hide the tooltip after a delay
        clearTimeout(hideTooltipTimeout); // Clear any existing timeout first
        hideTooltipTimeout = setTimeout(() => {
          updateTooltipVisibility(false); // Hide the tooltip
        }, 300); // Delay in milliseconds (e.g., 300ms). Adjust as needed.
      });
  
    // Add gridlines BEFORE the axes
    const gridlines = svg
      .append("g")
      .attr("class", "gridlines")
      // Position gridlines based on usableArea if they are only for the y-axis
      // If you want x-gridlines too, you'll need another set or adjust this.
      // For y-gridlines that span the usable width:
      .attr("transform", `translate(0, 0)`); // Gridlines will be drawn relative to SVG origin
  
    // Create y-gridlines
    gridlines
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat("")
          .tickSize(-usableArea.width) // Make ticks span the usable width
          .ticks(yScale.ticks().length) // Or specify number of ticks
      )
      .attr("transform", `translate(${usableArea.left},0)`); // Shift the gridlines group to start at usableArea.left
  
    const xAxis = d3.axisBottom(xScale);
  
    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
  
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");
  
    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(yAxis);
  
    createBrushSelector(svg);
  }

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

