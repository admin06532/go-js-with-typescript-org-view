import * as go from 'gojs';

export class OrgChartLayout extends go.TreeLayout {
  private static levelColors = ["#AC193D", "#2672EC", "#8C0095", "#5133AB",
        "#008299", "#D24726", "#008A00", "#094AB2"];

  constructor() {
    super();
    this.treeStyle = go.TreeLayout.StyleLastParents;
    this.arrangement = go.TreeLayout.ArrangementHorizontal;
    // properties for most of the tree:
    this.angle = 90;
    this.layerSpacing = 35;
    // properties for the "last parents":
    this.alternateAngle = 90;
    this.alternateLayerSpacing = 35;
    this.alternateAlignment = go.TreeLayout.AlignmentBus;
    this.alternateNodeSpacing = 20;
  }

  // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
  public commitNodes(): void {
    super.commitNodes();  // do the standard behavior
    if (this.network === null) return;
    // then go through all of the vertexes and set their corresponding node's Shape.fill
    // to a brush dependent on the TreeVertex.level value
    this.network.vertexes.each((v: go.LayoutVertex) => {
      if (v.node) {
        var tv = v as go.TreeVertex;
        var level = tv.level % (OrgChartLayout.levelColors.length);
        var color = OrgChartLayout.levelColors[level];
        var shape = v.node.findObject("SHAPE") as go.Shape;
        if (shape) shape.stroke = go.GraphObject.make(go.Brush, "Linear", { 0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right });
      }
    });
  }
}