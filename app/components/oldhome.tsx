import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Card, CardActions, Checkbox } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

//import * as contaminants from '../contaminants.json';

var app = require('electron').remote;
var dialog = app.dialog;
const path = require('path');
const contaminants = require('../contaminants.json');

class TextMobileStepper extends React.Component<{}, {

  activeStep: any,
  inputFiles: Array<any>,
  saveFiles: Array<any>,
  inputRefs: Array<any>,
  outputDir: String,
  showProgress: boolean,
  contamResult: any,
  contamStrRes: String,
  resultTable: any,
}>


{
  state = {
    activeStep: 0,
    inputFiles: new Array(),
    saveFiles: new Array(),
    outputDir: "",
    inputRefs: new Array(),
    showProgress: false,
    contamResult: JSON.parse("{}"),
    contamStrRes: "",
    resultTable: <div></div>,
  };

  constructor(props: any)
  {
    super(props);

    var self=this;
    Object.keys(contaminants).forEach(function(k){
        self.state.inputRefs.push({
            path: contaminants[k]["path"],
            type: contaminants[k]["type"],
            protected: contaminants[k]["protected"]
        });
    })
  }

  componentWillMount()
  {

  }

  render() {

    var tutorialSteps: any = this.getStepperSteps();
    const { activeStep } = this.state;
    const maxSteps = tutorialSteps.length;

    console.log("Render")

    return (
      <div>
        <Card
            style={{ marginBottom: "5px" }}>

            <CardContent>
                <div 
                    style={{ 
                        display: "block", 
                        marginLeft: "auto", 
                        marginRight: "auto", 
                        width: "50%" }}>
                            
                            {tutorialSteps[activeStep].imgPath ? 
                            <img src={tutorialSteps[activeStep].imgPath} width="400" height="100"/> 
                            : 
                            <div></div>}
                            
                            <p>{tutorialSteps[activeStep].header}</p> 
                </div>

                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    
                    nextButton=
                    {
                             /**
                        <Button 
                            size="small" 
                            onClick={this.handleNext} 
                            disabled={activeStep === maxSteps - 1}>
                                Next
                                <KeyboardArrowRight/>
                        </Button>
                            */ 
                
                        activeStep == maxSteps - 2 ?
                            (<Button
                                variant="contained"
                                color="secondary"
                                onClick={tutorialSteps[activeStep].buttonAction}
                                disabled={activeStep === maxSteps - 1}>
                                Start&nbsp;
                                <Icon>search</Icon>
                            </Button>) 
                            :
                            (<Button 
                                size="small" 
                                onClick={this.handleNext} 
                                disabled={activeStep === maxSteps - 1}>
                                Next
                                <KeyboardArrowRight/>
                            </Button>)
                           
                    }

                    backButton=
                    {
                        <Button 
                            size="small" 
                            onClick={this.handleBack} 
                            disabled={activeStep === 0}>
                            Reset
                            <Icon>youtube_searched_for</Icon>
                        </Button>
                    }/>
            </CardContent>
        </Card>
        

        <Card 
            style={{ marginBottom: "25px" }}>
            <CardContent>
                <Paper 
                    square elevation={0}>
                    <div>
                        {tutorialSteps[activeStep].label}
                    </div>
                </Paper>
            </CardContent>
        </Card>
        

        {tutorialSteps[activeStep].content}

      </div>
    );
  } // render()



  getStepperSteps() {

    var self = this;

    
    // TODO doppelten upload verhindern -> fastq und fasta
    
    // File List FastQ
    var inputListItems: any = [];
    var inputFileList = <List> {inputListItems} </List>;

    this.state.inputFiles.forEach(element => {
        
        var icon = <Icon>insert_drive_file</Icon>;
        if (element.type == "folder") {icon = <Icon>folder_open</Icon>;}

        inputListItems.push(
            <ListItem 
                key={inputListItems.length}>
                    <Avatar> {icon} </Avatar>
                    
                    <ListItemText 
                    primary={element.path} secondary={element.type}
                    />
                    
                    <IconButton 
                        aria-label="Delete" 
                        color="primary" 
                        onClick={() => self.handleSeqPathDelete(element)}>
                        <DeleteIcon/>
                    </IconButton>
            </ListItem>        
        )
    });


    // File List FastA
    var inputRefItems: any = [];
    var inputRefList = <List> {inputRefItems} </List>;
    var self = this;

    console.log("JSON HAS "+JSON.stringify(contaminants))
    console.log("References "+self.state.inputRefs)

    this.state.inputRefs.forEach(element => {

        var icon = <Icon>insert_drive_file</Icon>;
        if (element.type == "folder") {icon = <Icon>folder_open</Icon>;}

        element.enabled = element.enabled === undefined ? true : element.enabled;
          
        inputRefItems.push(
            <ListItem 
                key={inputRefItems.length}>
                    <Avatar>
                        {icon}
                    </Avatar>
                
                    <ListItemText 
                        primary={element.title || element.path} 
                        secondary={element.type}/>
                    
                    <Switch 
                        checked={element.enabled} 
                        color="primary"
                        onChange={() => {element.enabled = !element.enabled; 
                        this.setState({inputRefs: this.state.inputRefs})}}/> 

                    {element["protected"] ? <div></div>
                    : <IconButton 
                    aria-label="Delete" 
                    color="primary" 
                    //onClick={() => delete contaminants[k]}
                    onClick={() => self.handleRefPathDelete(element)}>
                    
                        <DeleteIcon/>
                    </IconButton>}
                    
            </ListItem>
        )
    })


    // File List Saving Fastq
    var inputSaveItems: any = [];
    var saveFileList = <List> {inputSaveItems} </List>
    var innerSaveItems: any = [];
    var innerSaveList = <List>{innerSaveItems}</List>

    // check aligned
    // check not aligned
    // additional card if ref.length > 1 for intersection
    // keyerror
    // on change -> python script

    this.state.inputFiles.forEach(element => {

        var icon = <Icon>insert_drive_file</Icon>;
        if (element.type == "folder") {icon = <Icon>folder_open</Icon>;}

        innerSaveItems.push(
            <ListItem
                key={inputSaveItems.length}>

                    <Avatar>
                        {icon}
                    </Avatar>

                    <ListItemText 
                        primary={element.path}
                        secondary={element.type}/>

                    <Checkbox
                        value = "true"/>
                    aligned

                    <Checkbox
                        value = "true"/>
                    not aligned

            </ListItem>
        )})

    this.state.inputRefs.forEach(element => {
        inputSaveItems.push(
            <ListItem
                key={inputRefList.key}>
                    <Card>
                        <ListItemText primary={element.path}/>
                        {innerSaveList}
                    </Card>
            </ListItem>
        )
   
   
   
    });
    



    return [
    {
        header: "header 1",
        
        label:
            <div>
                label
                <div></div>
                <div 
                    style={{ 
                        display: "inline-flex", 
                        verticalAlign: "middle", 
                        alignItems: "center" }}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24">
                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                    </svg>
                    unter svg
                </div>
            </div>,
        
        topimgPath: '../sequinfo_neg.jpg',
        
        imgPath: '../sequinfo_logo.jpeg',
        
        content: 
            <div style={{ 
                    display: "block", 
                    marginLeft: "auto", 
                    marginRight: "auto", 
                    width: "100%" }}>
                
                <Card
                    style={{ marginTop: "5px" }}>
                    <CardActions>
                        <Button
                            variant="contained"
                            color="default"
                            component="label"
                            onClick={() => this.handleSeqPath("file")}
                            style={{ marginTop: "10px" }}>
                                Upload File
                                <Icon>attach_file</Icon>
                        </Button>
                        
                        <Button
                            variant="contained"
                            color="default"
                            component="label"
                            onClick={() => this.handleSeqPath("folder")}
                            style={{ marginTop: "10px" }}>
                                Choose Directory
                                <Icon>attach_file</Icon>
                        </Button>
                    </CardActions>

                    <CardContent>
                        {inputFileList}
                    </CardContent>
                </Card>


                <Card 
                    style={{ marginTop: "5px" }}>
                    <CardContent>
                        <div>
                            <TextField
                                id="standard-full-name"
                                label="Current output directory:"
                                helperText="Directory will be genereated when you choose files. Alterations are possible directly in the Textfield."
                                value={this.state.outputDir}
                                fullWidth
                                onChange={this.handleOutputDirChange('outputDir')}
                                margin="normal"/>
                        </div>
                    </CardContent>
                </Card>


                <div 
                    style={{ 
                        marginTop: "25px",
                        marginBottom: "25px" }}>
                        <Button 
                            variant="contained" 
                            onClick={this.handleNext} 
                            size="large" 
                            style={{ backgroundColor: 'red', color: "white" }}>
                            Start&nbsp;
                            <Icon>bubble_chart</Icon>
                        </Button>
                </div>
        </div>
      },


      {
        header: 'header 2',
       
        label: 
            <div 
                style={{ 
                    display: "inline-flex", 
                    verticalAlign: "middle", 
                    alignItems: "center" }}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                </svg>
                Please enter each contamination file only in .fasta format!
            </div>,
        
        topimgPath: '../sequinfo_neg.jpg',

        imgPath: '../sequinfo_logo.jpeg',
        
        content:    
            <div>
                <Card>
                    <CardActions>
                        <Button 
                            variant="contained" 
                            color="default" 
                            component="label"
                            style={{ marginTop: "10px" }}
                            onClick={() => this.handleRefPath("file")}>
                                Upload
                                <Icon>attach_file</Icon>
                        </Button>
                    </CardActions>
                   
                    <CardContent>
                        {inputRefList}
                    </CardContent>

                    {this.state.showProgress ? 
                        <div>
                            <LinearProgress color="secondary"/>
                        </div>
                        :
                        <div></div>
                    }
                </Card>
            </div>,

        buttonAction: () => {
            var self = this
            this.state.showProgress = true;
            
            this.setState({ showProgress: this.state.showProgress })
            this.render()
            
            window.setTimeout(myFunction, 3000);
            
            function myFunction() {
                self.startPython();
            }
        }
    },



    {
        header: 'header 3',
        
        label: 
            <div 
                style={{ 
                    display: "inline-flex", 
                    verticalAlign: "middle", 
                    alignItems: "center" }}>
            
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                </svg>
                Please check the correctness carefully!
            </div>,

        topimgPath: '../sequinfo_neg.jpg',

        imgPath: '../sequinfo_logo.jpeg',

        content:
            <div>
            
            {this.state.resultTable}
            
                
                <Card
                    style={{ marginTop: "25px" }}>
                        <CardContent>
                            <p>Inserted .fastq files of sequencing reads:  --> TODO what to safe</p>
                            {saveFileList}
                        </CardContent>
                </Card>


                <div
                    style={{ 
                        marginTop: "25px",
                        marginBottom: "25px",
                        marginRight: "50px"}}>
                            <Button
                                variant="contained" 
                                onClick={this.handleBack} 
                                size="large" 
                                style={{ 
                                    backgroundColor: 'red', 
                                    color: "white",
                                    marginRight: "50px"
                                     }}>
                                        Reset
                                        <Icon>bubble_chart</Icon>
                            </Button>

                            <Button 
                                variant="contained" 
                                size="small">
                                    Save
                                    <Icon>save</Icon>
                            </Button>                            
                </div>
            </div>,
      },
    ]; // return
  } // getStepperSteps()













  

  // ### ALL ###
  // set correct next step in stage
  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  // correct backwards step
  handleBack = () => {
    this.setState(prevState => ({
      activeStep: 0,
      outputDir: "",
      inputFiles: new Array(),
      showProgress: false,
      contamResult: JSON.parse("{}"),
      contamStrRes: "",
      resultTable: <div></div>
    }));
  };




 // ### STEP 2 ###
 handleSeqPath(upType: String) {
    var self = this;

    if (upType == "file") {
      
      dialog.showOpenDialog(


        // remember selection for future use?


        // update for .fast5
        { filters: [
          { name: 'FastQ', extensions: ['fastq', 'FASTAQ', 'fq', 'FQ'] }
         ]},
        
        
        (fileNames: any) => {
        
        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
          console.log("No file selected");
          return;
        }
        
        fileNames.forEach((element: any) => {
          self.state.outputDir=path.join(path.dirname(element), "tmp");
          self.state.inputFiles.push({
            path: element,
            type: upType,
            protected: false
          });

        });

        console.log(self.state.inputFiles)
        self.setState({ inputFiles: self.state.inputFiles, outputDir: self.state.outputDir })
      });



    } else {
      dialog.showOpenDialog(
          { properties: ['openDirectory']},
        
        (dirName: any) => {
        
        if (dirName === undefined) {
          console.log("No file selected");
          return;
        }
        //@Rita this will push directory path to the array of inputFiles (also can be seen in card)
        dirName.forEach((element: any) => {
          self.state.outputDir = path.join(element,'tmp')
          self.state.inputFiles.push({
            path: element,
            type: upType,
          });
        });
        
        //@Rita this will push all .fastq files into the array of inputFiles (also can be seen in card)
        /*
        var fs = require('fs');
        dirName.forEach((element: any) => {
          fs.readdir(element, (err: any, files:any) => {
            files.forEach((file: any) => {
              self.state.outputDir=path.join(element, "tmp");
              if(file.endsWith(".fastq") || file.endsWith("FQ") || file.endsWith("fq") || file.endsWith("FASTAQ")){
                self.state.inputFiles.push({
                  path: path.join(element, file),
                  type: "file",
                });
              }
            });*/
            self.setState({ inputFiles: self.state.inputFiles, outputDir: self.state.outputDir })
          //})
        //});
      });
    }
  }


  handleSeqPathDelete(element: any) {
    var index = this.state.inputFiles.indexOf(element)
    if (index >= 0) {
      this.state.inputFiles.splice(index, 1)
    }
    this.setState({ inputFiles: this.state.inputFiles })
  }






  // ### STEP 3 ###
  handleRefPath(upType: String) {
    var self = this;

    if (upType == "file") {

      dialog.showOpenDialog(
        { filters: [
          { name: 'Fasta', extensions: ['fasta', 'FASTA', 'fa', 'FA'] }
         ]},

         (fileNames: any) => {
          if (fileNames === undefined) {
            console.log("No file selected");
            return;
          }

          fileNames.forEach((element: any) => {
            self.state.inputRefs.push({
              path: element,
              type: upType,
            });
  
          });
  
          console.log(self.state.inputRefs)
          self.setState({ inputRefs: self.state.inputRefs })




         }



      )
      
      

    } else {


      // TODO implement CHOOSE PATH


    }
  }

  handleRefPathDeleteJSON(key: any) {
    var fs = require('fs');
    delete contaminants[key];
    console.log(JSON.stringify(contaminants))
    fs.writeFile("./contaminants.json", JSON.stringify(contaminants), (err:any) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
    
  }

  handleRefPathDelete(element: any) {
    var index = this.state.inputRefs.indexOf(element)
    console.log(index)
    if (index >= 0) {
      this.state.inputRefs.splice(index, 1)
    }
    this.setState({ inputRefs: this.state.inputRefs })

    // save inputRefs to json
    
  }





  
  handleOutputDirChange = (outputDir:any) => (event:any) => {
    this.setState({outputDir: event.target.value,});
  };

  








   // ### STEP 4 ###
       startPython() {
        //const { exec } = require('child_process');
        //exec('pwd', (error:any, stdout:any, stderr:any) => {
        //if (error) {
        //  console.error(`exec error: ${error}`);
        //  return;
        //}
        //console.log(`stdout: ${stdout}`);
        //console.log(`stderr: ${stderr}`);
        //}); stdout: /Users/rita/iGEM/electron_boilerplate !!!!!!!!
        var self = this;
        var command = "ContamTool.py --reads ";
        var fs = require('fs');
    
        self.state.inputFiles.forEach(element => {
            var stats = fs.lstatSync(element.path)
            if (stats.isDirectory()){
                var allFilesInDir = fs.readdirSync(element.path);
                allFilesInDir.forEach((myFile:any) => {
                    if(myFile.toUpperCase().endsWith("FASTQ") || myFile.toUpperCase().endsWith("FQ")){
                        command = command + path.join(element.path, myFile)+" "
                    }
                });
            }else{
                command = command + element.path + " "
            }
        });
    
        
        command = command + "--cont "
        self.state.inputRefs.forEach(element => {if (element.enabled) {command = command + element.path+" "}})
        command = command + "--o " + self.state.outputDir
        var splitted_command = command.split(" "); 
        console.log(command+" command")
    
            const {spawn} = require('child_process');
            var child = spawn('python3', splitted_command);
            child.stdout.on('data', (data:any) => {
              console.log(`stdout: ${data}`);
              let obj = data;
              self.setState({contamStrRes: self.state.contamStrRes + obj});
            });
            
            child.stderr.on('data', (data:any) => {
              console.log(`stderr: ${data}`);
            });
            
            child.on('close', (code:any) => {
                console.log(`child process exited with code ${code}`);
                console.log(`child process returned ${self.state.contamStrRes}`);
                //self.setState({contamResult: JSON.parse(self.state.contamStrRes)})
                try {
                    JSON.parse(self.state.contamStrRes);
                    self.setState({contamResult: JSON.parse(self.state.contamStrRes)})
                } catch (e) {
                    self.setState({resultTable: <div>
                        <Card>
                            <CardContent>
                                <Typography color='secondary'>{self.state.contamStrRes}</Typography>
                            </CardContent>
                        </Card>
                        </div>})
                    self.handleNext();
                    return;
                }
            var resultTable = <div></div>
            self.state.inputRefs.forEach((element: any) => {
                var tablePart =
                <Table>
                <TableHead>
                <TableRow>
                <TableCell>Number of</TableCell>
                <TableCell numeric>Absolute value</TableCell>
                <TableCell numeric>Relative value</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            <TableRow>
                <TableCell component="th" scope="row">    
                Reads
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["totalReads"]}</TableCell>
                <TableCell numeric>1.00000</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Aligned reads
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["alignedReads"]}</TableCell>
                <TableCell numeric>{(self.state.contamResult[element.path]["alignedReads"]/self.state.contamResult[element.path]["totalReads"]).toFixed(5)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Unaligned reads
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["totalReads"]-self.state.contamResult[element.path]["alignedReads"]}</TableCell>
                <TableCell numeric>{((self.state.contamResult[element.path]["totalReads"]-self.state.contamResult[element.path]["alignedReads"])/self.state.contamResult[element.path]["totalReads"]).toFixed(5)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Bases
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["totalBases"]}</TableCell>
                <TableCell numeric>1.00000</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Alignment bases
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["alignmentBases"]}</TableCell>
                <TableCell numeric>{(self.state.contamResult[element.path]["alignmentBases"]/self.state.contamResult[element.path]["totalBases"]).toFixed(5)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Aligned bases
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["alignedLength"]}</TableCell>
                <TableCell numeric>{(self.state.contamResult[element.path]["alignedLength"]/self.state.contamResult[element.path]["totalBases"]).toFixed(5)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell component="th" scope="row">    
                Unaligned bases
                </TableCell>
                <TableCell numeric>{self.state.contamResult[element.path]["totalBases"]-self.state.contamResult[element.path]["alignedLength"]}</TableCell>
                <TableCell numeric>{((self.state.contamResult[element.path]["totalBases"]-self.state.contamResult[element.path]["alignedLength"])/self.state.contamResult[element.path]["totalBases"]).toFixed(5)}</TableCell>
            </TableRow>
            </TableBody>
            </Table>
            
            resultTable = <div> {resultTable}
            <Card>
                <CardContent >
                    <Typography align='center'>
                        Results for contamination file</Typography>
                    <Typography color='secondary' align='center'>{element.path}</Typography>
                    {tablePart}
                    <React.Fragment>
                        <Grid container>
                            <Grid item xs>
                                <img src={self.state.contamResult[element.path]["readsPie"]} width="480" height="360"/> 
                            </Grid>
                            <Grid item xs>
                                <img src={self.state.contamResult[element.path]["basesPie"]} width="480" height="360"/>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                    <img src={self.state.contamResult[element.path]["readLengthPlot"]}/> 
                </CardContent>
            </Card></div>
            })
            self.setState({resultTable: resultTable})
            self.handleNext();
            });  
        }
}

export default TextMobileStepper;