// pages/index.js
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Treemap from '../components/Treemap';
import GameReleasesChart from '../components/GameReleasesChart';
import RatingBarChart from '../components/RatingBarChart';

export default function Home() {
  const [rawData, setRawData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [treemapData, setTreemapData] = useState([]);
  const [ratingMap, setRatingMap] = useState({});

  const allGenres = ['Action', 'RPG', 'Simulation', 'Strategy', 'Casual', 'Other'];
  const allRatings = [
    'Overwhelmingly Negative', 'Very Negative', 'Mostly Negative', 'Mixed',
    'Mostly Positive', 'Very Positive', 'Overwhelmingly Positive'
  ];
  const colorScale = d3.scaleOrdinal().domain(allGenres).range(d3.schemeCategory10);

  useEffect(() => {
    d3.csv('/data.csv').then(data => {
      const cleaned = data.map(d => {
        const date = new Date(d.release_date);
        const year = !isNaN(date) ? date.getFullYear() : null;
        return {
          ...d,
          releaseYear: year,
          genre: d.genres,
          rating: d.overall_player_rating
        };
      }).filter(d => d.releaseYear && d.genre);

      setRawData(cleaned);
      const earliestYear = d3.min(cleaned, d => d.releaseYear);
      setSelectedYear(earliestYear);
    });
  }, []);

  useEffect(() => {
    if (!rawData.length || !selectedYear) return;
    const filtered = rawData.filter(d => d.releaseYear === selectedYear);

    const genreCounts = d3.rollups(
      filtered,
      v => v.length,
      d => d.genre
    ).map(([genre, count]) => ({ genre, count }));

    const total = d3.sum(genreCounts, d => d.count);
    genreCounts.forEach(d => d.percent = ((d.count / total) * 100).toFixed(1) + '%');

    setTreemapData(genreCounts);

    const ratingCounts = d3.rollup(
      filtered,
      v => v.length,
      d => d.rating
    );

    const ratingObject = Object.fromEntries(allRatings.map(r => [r, ratingCounts.get(r) || 0]));
    setRatingMap(ratingObject);
  }, [rawData, selectedYear]);

  const gamesByYearMap = d3.rollup(rawData, v => v.length, d => d.releaseYear);
  const yearList = [...new Set(rawData.map(d => d.releaseYear))].sort();

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Steam Game Visualization</h1>
        <p style={{ fontSize: '20px', color: '#666' }}>This project visualizes trends in major video game releases from 2001 to 2025, focusing on well-known titles from prominent companies. \n The top chart shows the amount of these major games released each year. The bottom treemap shows the category trends among major releases, and the bottom histogram illustrates the ratings distribution, showing how these high-profile games were scored across various rating ranges.</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label htmlFor="yearSelect">Select Year:</label>
        <select
          id="yearSelect"
          value={selectedYear || ''}
          onChange={e => setSelectedYear(+e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {yearList.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div style={{ width: '100%', marginBottom: '30px' }}>
        <GameReleasesChart
          gamesByYear={Object.fromEntries(gamesByYearMap)}
          onYearClick={(year) => setSelectedYear(year)}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <Treemap data={treemapData} />
        </div>

        <div style={{ flex: 1 }}>
          <RatingBarChart year={selectedYear} ratingMap={ratingMap} />
        </div>
      </div>
    </div>
  );
}
