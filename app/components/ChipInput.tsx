import * as React from 'react'; 

import ChipInput from 'material-ui-chip-input'
import * as Autosuggest from "react-autosuggest";
import * as match from 'autosuggest-highlight/match'
import * as parse from 'autosuggest-highlight/parse'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'




function renderInput (inputProps) {
    const { autoFocus, value, onChange, onAdd, onDelete, chips, ref, ...other } = inputProps
  
    return (
      <ChipInput
        clearInputValueOnChange
        onUpdateInput={onChange}
        onAdd={onAdd}
        onDelete={onDelete}
        value={chips}
        inputRef={ref}
        allowDuplicates={false}
        classes={null}
    />
    )
  }
  
  function renderSuggestion (suggestion, { query, isHighlighted }) {

    console.log("Render Suggestion")
    console.log(suggestion)

    const matches = match(suggestion.name, query)
    const parts = parse(suggestion.name, matches)


  
    return (
      <MenuItem
        selected={isHighlighted}
        component='div'
        onMouseDown={(e) => e.preventDefault()} // prevent the click causing the input to be blurred
      >
        <div>
          {parts.map((part, index) => {
            return part.highlight ? (
              <span key={String(index)} style={{ fontWeight: 300 }}>
                {part.text}
              </span>
            ) : (
              <strong key={String(index)} style={{ fontWeight: 500 }}>
                {part.text}
              </strong>
            )
          })}
        </div>
      </MenuItem>
    )
  }

  function renderSuggestionsContainer (options) {
    const { containerProps, children } = options
  
    console.log(children)

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    )
  }
  
  function getSuggestionValue (suggestion) {
    console.log("suggestion value")
    console.log(suggestion)
    return suggestion.name
  }
  
  function getSuggestions (value, availSuggestions) {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length
    let count = 0
  
    var filteredSuggestions = [];

    if (inputLength > 0)
    {
      filteredSuggestions = availSuggestions.filter(suggestion => {
        const keep =
            count < 5 && suggestion.name.toLowerCase().slice(0, inputLength) === inputValue
  
        if (keep) {
          count += 1
        }  
        return keep
      })
    }

    return filteredSuggestions;
  }
  


  export default class AutoSuggestChips extends React.Component<{datasource: any, callback: any}, { suggestions: any, value: any, textFieldInput: any}> {
    state = {
      // value: '',
      suggestions: [],
      value: [],
      textFieldInput: ''
    };
  
    handleSuggestionsFetchRequested = ({ value }) => {

      console.log("Suggestion Fetch")
      console.log(value);
      var newSuggestions = getSuggestions(value, this.props.datasource);

      console.log(newSuggestions);

      this.setState({
        suggestions: newSuggestions
      })
    };
  
    handleSuggestionsClearRequested = () => {

      console.log("Suggestions clear");

      this.setState({
        suggestions: []
      })
    };
  
    handletextFieldInputChange(event, {newValue}) {


      this.setState({
        textFieldInput: newValue
      })
    };
  
    handleAddChip (chip) {   
      
      this.handletextFieldInputChange(null, {newValue: ""});

      var newStateValue = this.state.value;

      if (this.props.callback != null)
      {
        this.props.callback(chip);
      }

      if (this.state.value.indexOf(chip) < 0)
      {

        //newStateValue = [...this.state.value, chip]

        this.setState({
          value: newStateValue,
          textFieldInput: '',
          suggestions: []
        })
      } else {

        this.setState({
          textFieldInput: '',
          suggestions: []
        })
      }
    }
    handleDeleteChip (chip, index) {
      let temp = this.state.value
      temp.splice(index, 1)
      this.setState({value: temp})
    }
  
    render () {

      var classes: any = {
        container: {
          flexGrow: 1,
          position: 'relative',
          height: "200px"
        },
        suggestionsContainerOpen: {
          position: 'absolute',
          marginTop: 5,
          marginBottom: 5 * 3,
          left: 0,
          right: 0
        },
        suggestionsList: {
          margin: 0,
          padding: 0,
          listStyleType: 'none'
        },
        suggestion: {
          display: 'block',
          height: "50px"
        },
        textField: {
          width: '100%'
        }
      };

      var self=this;

      console.log("Current Suggestions")
      console.log(this.state.suggestions)
      console.log(this.state.textFieldInput)
  
      return (
        <Autosuggest

          renderInputComponent={renderInput}
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={self.handleSuggestionsFetchRequested.bind(self)}
          onSuggestionsClearRequested={self.handleSuggestionsClearRequested.bind(self)}
          renderSuggestionsContainer={renderSuggestionsContainer}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={(e, {suggestionValue}) => { this.handleAddChip(suggestionValue); e.preventDefault() }}
          alwaysRenderSuggestions={true}
          inputProps={{
            classes: classes,
            chips: this.state.value,
            onChange: self.handletextFieldInputChange.bind(self),
            value: this.state.textFieldInput,
            onAdd: (chip) => this.handleAddChip(chip),
            onDelete: (chip, index) => this.handleDeleteChip(chip, index),
          }}
        />
      )
    }
  }

export interface OboChipACProps { helperText:string, onValueChange: any, datasource: Array<string>, callback: any};
export interface OboChipACState { values: Array<string>};

class AChipInput extends React.Component<OboChipACProps, OboChipACState>{

    constructor(props)
    {
        super(props);
    }

    componentWillMount()
    {
        var self=this;

        this.setState({values: []});
    }

    componentDidMount(){

    }

    acceptInput(value)
    {

        return true;


    }

    addElement(value)
    {
        if (this.props.datasource.indexOf(value) >= 0)
        {
            this.state.values.push(value)

            console.log("Going to add")
            console.log(value)


            console.log("ChipInput sending data");
            this.props.onValueChange(this.state.values);

            this.setState({values: this.state.values});

        }

    }
    deleteElement( idx, elem )
    {

        this.state.values.splice(idx, 1);
        this.setState({values: this.state.values});

        this.props.onValueChange(this.state.values);

    }

    handleAutoComplete(searchText)
    {
        return [searchText]
    }
  
    render(){
      return (

                <ChipInput
                            value={this.state.values}
                            dataSource={this.props.datasource}
                            fullWidth
                            fullWidthInput
                            classes={null}
                            helperText={this.props.helperText}
                            onAdd={(text) => {this.addElement(text)}}
                            onDelete={(text, index) => this.deleteElement(index, text )}
                        />

        )
    }
}