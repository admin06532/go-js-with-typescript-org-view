import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';
import { OrgChartLayout } from '../orgChartLayout';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  skipsDiagramUpdate: boolean;
  onModelChange: (e: go.IncrementalData) => void;
  divClassName?: "string";
  initDiagram?: () => void;

}

const DiagramWrapper = (props: DiagramProps) => {
  const diagramRef = React.createRef() as React.LegacyRef<ReactDiagram> | null;

  React.useEffect(() => {
    initDiagram2();
  }, [])

  const $ = go.GraphObject.make;




  const sharedModel: go.TreeModel = $(go.TreeModel,
    {
      // positive keys for nodes
      makeUniqueKeyFunction: (m: go.Model, data: any) => {
        let k = data.key || 1;
        while (m.findNodeDataForKey(k)) k++;
        data.key = k;
        return k;
      }
    });


  // const initDiagram1 = (): go.Diagram => {
  //   const myDiagram = $(go.Diagram, {
  //     'undoManager.isEnabled': true,  // must be set to allow for model change listening
  //     // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
  //     layout:
  //       $(go.TreeLayout,
  //         {
  //           alignment: go.TreeLayout.AlignmentStart,
  //           angle: 0,
  //           compaction: go.TreeLayout.CompactionNone,
  //           layerSpacing: 16,
  //           layerSpacingParentOverlap: 1,
  //           nodeIndentPastParent: 1.0,
  //           nodeSpacing: 0,
  //           setsPortSpot: false,
  //           setsChildPortSpot: false
  //         }),
  //     model: sharedModel
  //   });


  // // define a simple Node template
  // myDiagram.nodeTemplate = $(go.Node,
  //   {
  //     selectionAdorned: false,
  //     doubleClick: function(e, obj) {
  // console.log("doubleClick ----- working fine");
  //   var cmd = myDiagram.commandHandler;
  //   var node = obj as go.Node;
  //   if (node.isTreeExpanded) {
  //     if (!cmd.canCollapseTree(node)) return;
  //   } else {
  //     if (!cmd.canExpandTree(node)) return;
  //   }
  //   e.handled = true;
  //   if (node.isTreeExpanded) {
  //     cmd.collapseTree(node);
  //   } else {
  //     cmd.expandTree(node);
  //   }
  // }
  // },
  // new go.Binding("isSelected", "sel").makeTwoWay(),
  // $("TreeExpanderButton",
  //   { // customize the button's appearance
  //     "_treeExpandedFigure": "ExpandedLine",
  //     "_treeCollapsedFigure": "CollapsedLine",
  //     "ButtonBorder.fill": "whitesmoke",
  //     "ButtonBorder.stroke": null,
  //     "_buttonFillOver": "rgba(0,128,255,0.25)",
  //     "_buttonStrokeOver": null
  //   }
  // ),
  //   $(go.TextBlock,
  //     { position: new go.Point(18, 2), font: '9pt Verdana, sans-serif' },
  //     new go.Binding("text", "name"),
  //     new go.Binding("background", "isSelected", function (s) { return (s ? "lightblue" : "white"); }).ofObject()
  //   )
  // );  // end Node

  // myDiagram.linkTemplate = $(go.Link);

  // return myDiagram;
  // }

  const initDiagram2 = (): go.Diagram => {
    const diagram = $(go.Diagram,
      {
        'undoManager.isEnabled': true,  // must be set to allow for model change listening
        // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
        maxSelectionCount: 1, // users can select only one part at a time
        validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
        layout: new OrgChartLayout(),
        model: sharedModel
      });

    // when a node is double-clicked, add a child to it
    function nodeDoubleClick(e: go.InputEvent, obj: go.GraphObject) {
      console.log("nodeDoubleClick is working fine");
      // var clicked = obj.part;
      // if (clicked !== null) {
      //   var thisemp = clicked.data;
      //   diagram.startTransaction("add employee");
      //   var newemp = {
      //     name: "(new person)",
      //     title: "",
      //     comments: "",
      //     parent: thisemp.key
      //   };
      //   diagram.model.addNodeData(newemp);
      //   diagram.commitTransaction("add employee");
      // }
    }

    // this is used to determine feedback during drags
    function mayWorkFor(node1: go.Node | null, node2: go.Node) {
      if (!(node1 instanceof go.Node)) return false;  // must be a Node
      if (node1 === node2) return false;  // cannot work for yourself
      if (node2.isInTreeOf(node1)) return false;  // cannot work for someone who works for you
      return true;
    }

    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    function textStyle() {
      return { font: "9pt  Segoe UI,sans-serif", stroke: "white" };
    }

    // This converter is used by the Picture.
    function findHeadShot(key: number) {
      if (key < 0 || key > 16) return "https://gojs.net/latest/samples/images/HSnopic.jpg"; // There are only 16 images on the server
      return "https://gojs.net/latest/samples/images/HS" + key + ".jpg"
    }

    // define the Node template
    diagram.nodeTemplate =
      $(go.Node, "Auto",
        { doubleClick: nodeDoubleClick },
        { // handle dragging a Node onto a Node to (maybe) change the reporting relationship
          mouseDragEnter: function (e, obj, prev) {
            var node = obj as go.Node;
            var d = node.diagram;
            if (d == null) return;
            var selnode = d.selection.first() as go.Node;
            if (!mayWorkFor(selnode, node)) return;
            var shape = node.findObject("SHAPE") as go.Shape;
            if (shape) {
              (shape as any)._prevFill = shape.fill;  // remember the original brush
              shape.fill = "darkred";
            }
          },
          mouseDragLeave: function (e, obj, next) {
            var node = obj as go.Node;
            var shape = node.findObject("SHAPE") as go.Shape;
            if (shape && (shape as any)._prevFill) {
              shape.fill = (shape as any)._prevFill;  // restore the original brush
            }
          },
          mouseDrop: function (e, obj) {
            var node = obj as go.Node;
            var d = node.diagram;
            if (d == null) return;
            var selnode = d.selection.first() as go.Node;  // assume just one Node in selection
            if (mayWorkFor(selnode, node)) {
              // find any existing link into the selected node
              var link = selnode.findTreeParentLink();
              if (link !== null) {  // reconnect any existing link
                link.fromNode = node;
              } else {  // else create a new link
                d.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
              }
            }
          }
        },
        // for sorting, have the Node.text be the data.name
        new go.Binding("text", "name"),
        // bind the Part.layerName to control the Node's layer depending on whether it isSelected
        new go.Binding("layerName", "isSelected", function (sel) { return sel ? "Foreground" : ""; }).ofObject(),
        new go.Binding("isSelected", "sel").makeTwoWay(),
        // define the node's outer shape
        $(go.Shape, "Rectangle",
          {
            name: "SHAPE", fill: "#333333", stroke: 'white', strokeWidth: 3.5,
            // set the port properties:
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
          }),
        $(go.Panel, "Horizontal",
          $(go.Picture,
            {
              name: "Picture",
              desiredSize: new go.Size(70, 70),
              margin: 1.5,
            },
            new go.Binding("source", "key", findHeadShot)),
          // define the panel where the text will appear
          $(go.Panel, "Table",
            {
              minSize: new go.Size(130, NaN),
              maxSize: new go.Size(150, NaN),
              margin: new go.Margin(6, 10, 0, 6),
              defaultAlignment: go.Spot.Left
            },
            $(go.RowColumnDefinition, { column: 2, width: 4 }),
            $(go.TextBlock, textStyle(),  // the name
              {
                row: 0, column: 0, columnSpan: 5,
                font: "12pt Segoe UI,sans-serif",
                editable: true, isMultiline: false,
                minSize: new go.Size(10, 16)
              },
              new go.Binding("text", "name").makeTwoWay()),
            $(go.TextBlock, "Title: ", textStyle(),
              { row: 1, column: 0 }),
            $(go.TextBlock, textStyle(),
              {
                row: 1, column: 1, columnSpan: 4,
                editable: true, isMultiline: false,
                minSize: new go.Size(10, 14),
                margin: new go.Margin(0, 0, 0, 3)
              },
              new go.Binding("text", "title").makeTwoWay()),
            $(go.TextBlock, textStyle(),
              { row: 2, column: 0 },
              new go.Binding("text", "key", function (v) { return "ID: " + v; })),
            $(go.TextBlock, textStyle(),
              { name: "boss", row: 2, column: 3, }, // we include a name so we can access this TextBlock when deleting Nodes/Links
              new go.Binding("text", "parent", function (v) { return "Boss: " + v; })),
            $(go.TextBlock, textStyle(),  // the comments
              {
                row: 3, column: 0, columnSpan: 5,
                font: "italic 9pt sans-serif",
                wrap: go.TextBlock.WrapFit,
                editable: true,  // by default newlines are allowed
                minSize: new go.Size(10, 14)
              },
              new go.Binding("text", "comments").makeTwoWay())
          )  // end Table Panel
        ) // end Horizontal Panel
      );  // end Node


    diagram.nodeTemplate.contextMenu =
      $("ContextMenu",
        $("ContextMenuButton",
          $(go.TextBlock, "Vacate Position"),
          {
            click: function (e, obj) {
              var node = (obj.part as go.Adornment).adornedPart as go.Node;
              if (node !== null) {
                var thisemp = node.data;
                diagram.startTransaction("vacate");
                // update the key, name, and comments
                diagram.model.setDataProperty(thisemp, "name", "(Vacant)");
                diagram.model.setDataProperty(thisemp, "comments", "");
                diagram.commitTransaction("vacate");
              }
            }
          }
        ),
        $("ContextMenuButton",
          $(go.TextBlock, "Remove Role"),
          {
            click: function (e, obj) {
              // reparent the subtree to this node's boss, then remove the node
              var node = (obj.part as go.Adornment).adornedPart as go.Node;
              if (node !== null) {
                diagram.startTransaction("reparent remove");
                var chl = node.findTreeChildrenNodes();
                // iterate through the children and set their parent key to our selected node's parent key
                while (chl.next()) {
                  var emp = chl.value;
                  (diagram.model as go.TreeModel).setParentKeyForNodeData(emp.data, node.findTreeParentNode()?.data.key);
                }
                // and now remove the selected node itself
                diagram.model.removeNodeData(node.data);
                diagram.commitTransaction("reparent remove");
              }
            }
          }
        ),
        $("ContextMenuButton",
          $(go.TextBlock, "Remove Department"),
          {
            click: function (e, obj) {
              // remove the whole subtree, including the node itself
              var node = (obj.part as go.Adornment).adornedPart as go.Node;
              if (node !== null) {
                diagram.startTransaction("remove dept");
                diagram.removeParts(node.findTreeParts(), false);
                diagram.commitTransaction("remove dept");
              }
            }
          }
        )
      );

    // define the Link template
    diagram.linkTemplate = $(go.Link, go.Link.Orthogonal,
      { corner: 5, relinkableFrom: true, relinkableTo: true },
      $(go.Shape, { strokeWidth: 1.5, stroke: "#F5F5F5" }))
    return diagram;
  }

  return (
    <div className='diagram-wrapper'>
      {diagramRef ? (<ReactDiagram
        ref={diagramRef}
        divClassName='diagram-component-2'
        initDiagram={initDiagram2}
        nodeDataArray={props.nodeDataArray}
        onModelChange={props.onModelChange}
        skipsDiagramUpdate={props.skipsDiagramUpdate}
      />) : <p>Loading...</p>}
    </div>
  );
}

export default DiagramWrapper;