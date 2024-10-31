import { Component, Input, OnChanges } from '@angular/core';
import { CanvasJSAngularChartsModule, CanvasJS } from '@canvasjs/angular-charts';

CanvasJS.addColorSet("customColorSet", ["#ffcb06", "#ce1249", "#3a943c", "#7f3e83", "#812900", "#2078b6", "#df7f2e", "#e3e3e3"]);

@Component({
  selector: 'app-macronutrient-chart',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './macronutrient-chart.component.html',
  styleUrls: ['./macronutrient-chart.component.css']
})
export class MacronutrientChartComponent implements OnChanges {
  @Input() totalProteins?: number = 0;
  @Input() totalCarbs?: number = 0;
  @Input() totalFats?: number = 0;

  chartOptions: any;

  ngOnChanges(): void {
    this.createChart();
  }

  createChart() {
    this.chartOptions = {
      animationEnabled: true,
      theme: "dark2",
      colorSet: "customColorSet",
      title: {
        text: "Distribución de Macronutrientes"
      },
      data: [{
        type: "doughnut",
        indexLabel: "{label}: {y}g",
        innerRadius: "80%",
        dataPoints: [
          { y: this.totalProteins, label: "Proteínas" },
          { y: this.totalCarbs, label: "Carbohidratos" },
          { y: this.totalFats, label: "Grasas" }
        ]
      }]
    };
  }
}
