'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import webgazer from 'webgazer';

export default function EyeExperiencePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <h1 className="mb-6 text-4xl font-bold text-[#3a3947]">
        Eye Tracking Experience Page
      </h1>
      <p className="mb-8 text-lg text-[#5a5868]">
        This is where users can experience the eye tracking experiment.
      </p>
      {/* Add eye tracking experience components and functionality as needed */}
      <EyeTrackingCollision />
    </div>
  );
}

const EyeTrackingCollision = () => {
  const svgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const forceRef = useRef(null);
  const nodesRef = useRef([]);
  const previewWidthRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initializeWebGazer = async () => {
      try {
        // Dynamically import webgazer only on client side
        const webgazer = (await import('webgazer')).default;
        
        // Initialize WebGazer
        const webgazerInstance = await webgazer
          .setRegression('ridge')
          .setTracker('TFFacemesh')
          .begin();

        if (!mounted) return;

        webgazerInstance
          .showVideoPreview(true)
          .showPredictionPoints(false)
          .applyKalmanFilter(true);

        previewWidthRef.current = webgazer.params.videoViewerWidth;

        // Setup collision system
        setupCollisionSystem();
        
        // Set gaze listener
        webgazer.setGazeListener(handleGaze);

        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          setError('Error initializing eye tracking: ' + err.message);
          setIsLoading(false);
        }
      }
    };

    const setupCollisionSystem = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const numberOfNodes = 200;

      // Create nodes
      nodesRef.current = d3.range(numberOfNodes).map(() => ({
        radius: Math.random() * 12 + 4
      }));
      
      nodesRef.current[0].radius = 0;
      nodesRef.current[0].fixed = true;

      // Create force simulation
      forceRef.current = d3.forceSimulation(nodesRef.current)
        .force("charge", d3.forceManyBody().strength((d, i) => i ? 0 : -2000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.radius + 16))
        .alphaDecay(0.02);

      // Create SVG
      const svg = d3.select(svgRef.current);
      
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const colors = Array(numberOfNodes - 2).fill(color(0));
      colors.push("orange");

      // Add circles
      svg.selectAll("circle")
        .data(nodesRef.current.slice(1))
        .enter()
        .append("circle")
        .attr("r", d => d.radius)
        .style("fill", (d, i) => colors[i]);

      // Tick handler
      forceRef.current.on("tick", () => {
        svg.selectAll("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });

      // Add eye tracking lines
      svg.append("line")
        .attr("id", "eyeline1")
        .attr("stroke-width", 2)
        .attr("stroke", "red");

      svg.append("line")
        .attr("id", "eyeline2")
        .attr("stroke-width", 2)
        .attr("stroke", "red");

      svg.append("rect")
        .attr("id", "predictionSquare")
        .attr("width", 5)
        .attr("height", 5)
        .attr("fill", "red");

      // Mouse move handler as fallback
      svg.on("mousemove", function(event) {
        const [x, y] = d3.pointer(event);
        nodesRef.current[0].fx = x;
        nodesRef.current[0].fy = y;
        forceRef.current.alpha(0.3).restart();
      });
    };

    const handleGaze = async (data, clock) => {
      if (!data || !nodesRef.current.length) return;

      nodesRef.current[0].fx = data.x;
      nodesRef.current[0].fy = data.y;
      forceRef.current?.alpha(0.3).restart();

      try {
        const webgazer = (await import('webgazer')).default;
        const fmPositions = await webgazer.getTracker().getPositions();
        const whr = webgazer.getVideoPreviewToCameraResolutionRatio();
        const previewWidth = previewWidthRef.current;

        d3.select('#eyeline1')
          .attr("x1", data.x)
          .attr("y1", data.y)
          .attr("x2", previewWidth - fmPositions[145][0] * whr[0])
          .attr("y2", fmPositions[145][1] * whr[1]);

        d3.select("#eyeline2")
          .attr("x1", data.x)
          .attr("y1", data.y)
          .attr("x2", previewWidth - fmPositions[374][0] * whr[0])
          .attr("y2", fmPositions[374][1] * whr[1]);

        d3.select("#predictionSquare")
          .attr("x", data.x)
          .attr("y", data.y);
      } catch (err) {
        console.error('Error in gaze handler:', err);
      }
    };

    initializeWebGazer();

    return () => {
      mounted = false;
      // Dynamically access webgazer for cleanup
      import('webgazer').then(({ default: webgazer }) => {
        if (webgazer) {
          webgazer.end();
        }
      }).catch(() => {
        // Ignore errors during cleanup
      });
    };
  }, []);

  const startCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 3000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 100000 }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Initializing eye tracking...</p>
            <p className="text-gray-400 text-sm mt-2">Please allow camera access</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
          <div className="bg-red-900 border border-red-700 text-white px-6 py-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg z-50">
          <h2 className="font-bold mb-2">Eye Tracking Collision Demo</h2>
          <p className="text-sm mb-2">Look around to move particles away from your gaze</p>
          <button
            onClick={startCalibration}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
          >
            {isCalibrating ? 'Calibrating...' : 'Recalibrate'}
          </button>
          <p className="text-xs mt-2 text-gray-300">
            Click 9 points on screen to calibrate
          </p>
        </div>
      )}
    </div>
  );
};
