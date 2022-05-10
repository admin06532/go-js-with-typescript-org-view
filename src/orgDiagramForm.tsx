import React from 'react';

interface IState {
    orgJson: IOrg[] | [],
    entries: IOrg | null
}

interface IOrg {
    key: number;
    name: string;
    title: string;
    parent?: number;
}

export class OrgDiagramForm extends React.PureComponent<{}, IState> {

    constructor(props) {
        super(pros)
        this.state = {
            orgJson: [],
            entries: null
        }
    }

    onChangeInput = (e) => {
        const { name, value } = e.currentTarget;
        this.setState((prevState: Readonly<IState>) => {
            return {
                ...prevState,
                entries: {
                    ...prevState.entries,
                    [name]: value
                }
            }
        })
    }

    submitFormData = () => {
        this.setState((prevState: readonly<IState>) => {

            return {
                orgJson: [...prevState.orgJson, prevState.entries],
                entries: null
            }
        }
    }

    resetFormData = () => {
        this.setState({ entries: null })
    }

    render() {
        return (
            <>
                <div>
                    <input type="text" onChange={this.onChangeInput.bind(this)} value={this.state.entries["title"]} name="title" /><br />
                    <input type="text" onChange={this.onChangeInput.bind(this)} value={this.state.entries["name"]} name="name" /><br />
                    <input type="text" disabled value={this.state.entries["key"]} name="key" /><br />
                    <input type="text" onChange={this.onChangeInput.bind(this)} value={this.state.entries["parent"]} name="parent" /><br />

                    <button onClick={this.submitFormData} type="button">Add</button> {' '}
                    <button onClick={this.resetFormData} type="button">Clear</button>


                </div>
                <pre>
                    {JSON.stringify(this.state.orgJson, null, 4)}
                </pre>
            </>
        )
    }
}