import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';
import './App.css';

const DiagramWrapper = React.lazy(() => import('./components/DiagramWrapper'));


interface AppState {
  nodeDataArray: Array<go.ObjectData>;
  skipsDiagramUpdate: boolean;
}

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;

  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
        { key: 1, name: "Stella Payne Diaz", title: "CEO" },
        { key: 2, name: "Luke Warm", title: "VP Marketing/Sales", parent: 1 },
        { key: 3, name: "Meg Meehan Hoffa", title: "Sales", parent: 2 },
        { key: 4, name: "Peggy Flaming", title: "VP Engineering", parent: 1 },
        { key: 5, name: "Saul Wellingood", title: "Manufacturing", parent: 4 },
        { key: 6, name: "Al Ligori", title: "Marketing", parent: 2 },
        { key: 7, name: "Dot Stubadd", title: "Sales Rep", parent: 3 },
        { key: 8, name: "Les Ismore", title: "Project Mgr", parent: 5 },
        { key: 9, name: "April Lynn Parris", title: "Events Mgr", parent: 6 },
        { key: 10, name: "Xavier Breath", title: "Engineering", parent: 4 },
        { key: 11, name: "Anita Hammer", title: "Process", parent: 5 },
        { key: 12, name: "Billy Aiken", title: "Software", parent: 10 },
        { key: 13, name: "Stan Wellback", title: "Testing", parent: 10 },
        { key: 14, name: "Marge Innovera", title: "Hardware", parent: 10 },
        { key: 15, name: "Evan Elpus", title: "Quality", parent: 5 },
        { key: 16, name: "Lotta B. Essen", title: "Sales Rep", parent: 3 }
      ],
      skipsDiagramUpdate: false
    };
    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleModelChange = this.handleModelChange.bind(this);
  }

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  public handleModelChange(obj: go.IncrementalData) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: AppState) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {  // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }
        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
  }

  public render() {
    return (
      <React.Suspense fallback={'Loading your components'}>
      <div className='container'>
        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onModelChange={this.handleModelChange}
        />
      </div>
      </React.Suspense>
    );
  }
}

export default App;
