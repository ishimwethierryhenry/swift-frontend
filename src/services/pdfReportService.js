// FRONTEND: src/services/pdfReportService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

class PDFReportService {
  
  static async generateAnalyticsReport(analyticsData, timeRange, selectedPool) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 82, 130);
    doc.text('SWIFT - Water Quality Analytics Report', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    doc.text(`Time Range: ${timeRange.toUpperCase()} | Pool: ${selectedPool === 'all' ? 'All Pools' : selectedPool}`, pageWidth / 2, currentY + 5, { align: 'center' });
    
    currentY += 20;

    // Draw header line
    doc.setLineWidth(0.5);
    doc.setDrawColor(44, 82, 130);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 15;

    // System Health Metrics Section
    if (analyticsData.systemHealth) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('System Health Overview', 20, currentY);
      currentY += 10;

      // Create metrics table
      const metricsData = [
        ['System Uptime', `${analyticsData.systemHealth.uptime}%`],
        ['Active Pools', analyticsData.systemHealth.activePools.toString()],
        ['Total Tests Conducted', analyticsData.systemHealth.totalTests.toLocaleString()],
        ['Data Quality Score', `${analyticsData.systemHealth.dataQuality}%`],
        ['Average Response Time', `${analyticsData.systemHealth.avgResponseTime}ms`],
        ['Error Rate', `${analyticsData.systemHealth.errorRate}%`]
      ];

      doc.autoTable({
        startY: currentY,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [44, 82, 130], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Pool Status Distribution
    if (analyticsData.poolStatistics && analyticsData.poolStatistics.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Pool Status Distribution', 20, currentY);
      currentY += 10;

      const statusData = analyticsData.poolStatistics.map(stat => [
        stat.name,
        stat.value.toString(),
        `${((stat.value / analyticsData.poolStatistics.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%`
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Status', 'Count', 'Percentage']],
        body: statusData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Check if we need a new page
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    // Water Quality Trends Summary
    if (analyticsData.waterQualityTrends && analyticsData.waterQualityTrends.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Water Quality Trends Summary', 20, currentY);
      currentY += 10;

      // Get last 10 data points for summary
      const recentTrends = analyticsData.waterQualityTrends.slice(-10);
      const trendsData = recentTrends.map(trend => [
        trend.date,
        trend.avgPH,
        trend.avgTurbidity,
        trend.avgConductivity,
        `${trend.optimalReadings}/${trend.totalReadings}`,
        `${((trend.optimalReadings / trend.totalReadings) * 100).toFixed(1)}%`
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Date', 'Avg pH', 'Avg Turbidity', 'Avg Conductivity', 'Optimal/Total', 'Success Rate']],
        body: trendsData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Operator Performance (if available)
    if (analyticsData.operatorPerformance && analyticsData.operatorPerformance.length > 0) {
      // Check if we need a new page
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Operator Performance Summary', 20, currentY);
      currentY += 10;

      const operatorData = analyticsData.operatorPerformance.map(op => [
        op.name,
        op.testsCompleted.toString(),
        `${op.avgResponseTime} min`,
        `${op.efficiency}%`
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Operator', 'Tests Completed', 'Avg Response Time', 'Efficiency']],
        body: operatorData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Recommendations Section
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, currentY);
    currentY += 10;

    const recommendations = this.generateRecommendations(analyticsData);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 40);
      doc.text(lines, 25, currentY);
      currentY += lines.length * 4 + 2;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('SWIFT Water Quality Management System', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    return doc;
  }

  static async generateAnalyticsReportWithCharts(analyticsData, timeRange, selectedPool) {
    const doc = await this.generateAnalyticsReport(analyticsData, timeRange, selectedPool);
    
    try {
      // Capture chart screenshots if charts are visible
      const chartElements = document.querySelectorAll('[data-chart-type]');
      
      for (let i = 0; i < chartElements.length && i < 3; i++) {
        const element = chartElements[i];
        if (element && element.offsetHeight > 0) {
          const canvas = await html2canvas(element, {
            backgroundColor: '#1e293b',
            scale: 1,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          doc.addPage();
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`Chart ${i + 1}`, 20, 20);
          
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          doc.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
        }
      }
    } catch (error) {
      console.warn('Could not capture charts for PDF:', error);
    }

    return doc;
  }

  static generateRecommendations(analyticsData) {
    const recommendations = [];
    
    if (analyticsData.systemHealth) {
      if (analyticsData.systemHealth.dataQuality < 90) {
        recommendations.push('Consider reviewing data collection procedures to improve data quality score.');
      }
      
      if (analyticsData.systemHealth.avgResponseTime > 500) {
        recommendations.push('System response time is elevated. Consider optimizing database queries and server performance.');
      }
      
      if (analyticsData.systemHealth.uptime < 99) {
        recommendations.push('Implement additional monitoring and redundancy measures to improve system uptime.');
      }
    }

    if (analyticsData.poolStatistics) {
      const totalPools = analyticsData.poolStatistics.reduce((sum, stat) => sum + stat.value, 0);
      const criticalPools = analyticsData.poolStatistics.find(stat => stat.name === 'Critical')?.value || 0;
      
      if (criticalPools > 0) {
        recommendations.push(`${criticalPools} pools require immediate attention. Schedule maintenance for critical status pools.`);
      }
      
      const optimalPools = analyticsData.poolStatistics.find(stat => stat.name === 'Optimal')?.value || 0;
      const optimalPercentage = (optimalPools / totalPools) * 100;
      
      if (optimalPercentage < 70) {
        recommendations.push('Overall pool performance is below optimal. Review maintenance schedules and water treatment procedures.');
      }
    }

    if (analyticsData.waterQualityTrends && analyticsData.waterQualityTrends.length > 0) {
      const latestTrend = analyticsData.waterQualityTrends[analyticsData.waterQualityTrends.length - 1];
      
      if (parseFloat(latestTrend.avgPH) < 7.0 || parseFloat(latestTrend.avgPH) > 8.0) {
        recommendations.push('pH levels are outside optimal range. Adjust chemical dosing systems.');
      }
      
      if (parseFloat(latestTrend.avgTurbidity) > 50) {
        recommendations.push('Turbidity levels are elevated. Check filtration systems and consider backwashing filters.');
      }
      
      if (parseFloat(latestTrend.avgConductivity) > 2000) {
        recommendations.push('Conductivity levels are high. Review water source quality and consider dilution or treatment.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing optimally. Continue current maintenance procedures.');
      recommendations.push('Consider implementing predictive maintenance to prevent future issues.');
      recommendations.push('Regular staff training on water quality standards is recommended.');
    }

    return recommendations;
  }

  static async downloadPDF(doc, filename) {
    doc.save(filename);
  }

  static async generateQuickReport(data, title) {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(key => String(item[key] || '')));
      
      doc.autoTable({
        startY: 50,
        head: [headers],
        body: rows,
        theme: 'grid'
      });
    }
    
    return doc;
  }
}

export default PDFReportService;