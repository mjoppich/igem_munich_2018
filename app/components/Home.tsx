import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Card, CardActions, CardHeader } from '@material-ui/core';
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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import Gallery from './ImageGallery';


const {shell} = require('electron');
const {spawnSync} = require('child_process');

var remote = require('electron').remote;
var os = require("os");
var fs = require('fs');
const shellPath = require('shell-path');


var dialog = remote.dialog;


const path = require('path');
const contaminants = require('data/contaminants.json');

class TextMobileStepper extends React.Component<{}, {

    activeStep: any,
    inputFiles: Array<any>,
    saveFiles: any,
    inputRefs: Array<any>,
    outputDir: String,
    contamResult: any,
    contamStrRes: String,
    resultTable: any,
    helpExpanded: boolean,
    showProgress: boolean,
    showProgress2: boolean,
    showImages: boolean
}>


{
  state = {
    activeStep: 0,
    inputFiles: new Array(),
    saveFiles: JSON.parse("{}"),
    outputDir: "",
    inputRefs: new Array(),
    contamResult: JSON.parse("{}"),
    contamStrRes: "",
    resultTable: <div></div>,
    helpExpanded: false,
    showProgress: false,
    showProgress2: false,
    showImages: false
  };

  constructor(props: any)
  {
    super(props);

    console.log(contaminants);


    this.loadContaminants(); 
    
    if (this.state.inputRefs.length == 0)
    {
        var self=this;
        contaminants.forEach((contaminant:any) => {
            self.state.inputRefs.push(contaminant);
        });
    }
  }


  getDataPath()
  {

    var eprocess = remote.getGlobal('process');

    if (process.env.NODE_ENV == 'production')
    {
        return path.resolve(`${eprocess.resourcesPath}/../data/`);
    } else {
        return path.join(path.resolve(""), "app", "data");
    }

  }


  componentWillMount()
  {
      // TODO
  }

  sequintoLogo = "sequinto_logo_text.png"
  largeMargin = "20px"
  smallMargin = "10px"

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
                        width: "100%"}}>

                            
                            <img 
                                style={{
                                    verticalAlign: "middle",
                                    maxHeight: "75px", 
                                    width: "auto", 
                                    height: "auto",
                                    marginBottom: this.largeMargin,
                                    display: "block",
                                    marginLeft: "auto",
                                    marginRight: "auto"}} 
                                src={this.sequintoLogo}/> 

                            <span><p style={{display: "inline"}}>{tutorialSteps[activeStep].header}</p></span>
                </div>


                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}

                    nextButton=
                    {
                        activeStep == maxSteps - 2 ?

                            (<Button
                                variant="contained"
                                color="secondary"
                                onClick={tutorialSteps[activeStep].buttonAction}
                                disabled={this.state.showProgress}
                                >
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
                            </Button>
                            )

                    }

                    backButton=
                    {
                        <div>
                                <Button
                                size="small"
                                onClick={() => {this.handleBack(true)}}
                                disabled={activeStep === 0}>
                                Reset
                                <Icon>youtube_searched_for</Icon>
                            </Button>
                            
                        </div>
                    }/>
            </CardContent>
        </Card>

        <Card
            style={{
                marginTop: "5px",
                marginBottom: "20px"}}>


       <CardHeader
          title={"Step " + (activeStep+1) + ": " + tutorialSteps[activeStep].headerName }
          subheader={tutorialSteps[activeStep].alarmlabel}
        />



        <div>
            <img 
                src={tutorialSteps[activeStep].imgPath}
                style={{
                    maxHeight: "150px",
                    width: "auto",
                    height: "auto",
                    verticalAlign: "middle",
                    marginLeft: "20px",
                    marginRight: "auto"

                }}/>
        </div>


        <CardActions disableActionSpacing>

          <IconButton

            onClick={() => this.setState({helpExpanded: !this.state.helpExpanded})}
            aria-expanded={this.state.helpExpanded}
          >
            <ExpandMoreIcon />
          </IconButton>


        </CardActions>
        <Collapse in={this.state.helpExpanded} timeout="auto" unmountOnExit>


          <CardContent>
            {tutorialSteps[activeStep].label}
          </CardContent>
        </Collapse>


        </Card>

        {tutorialSteps[activeStep].content}

      </div>
    );
  } // render()



  getStepperSteps() {

    var self = this;


    // File List FastQ
    var inputListItems: any = [];
    var inputFileList = <List> {inputListItems} </List>;

    this.state.inputFiles.forEach(element => {

        var icon = <Icon>insert_drive_file</Icon>;
        var enableFast5Extract = null;


        if (element.type == "folder")
        {  
            icon = <Icon>folder_open</Icon>;
            enableFast5Extract = <div><Switch
                                    checked={element.forceFast5Extract}
                                    color="primary"
                                    onChange={() => {element.forceFast5Extract = !element.forceFast5Extract;
                                    this.setState({inputRefs: this.state.inputRefs})}}/></div>
        }
        var enableTrancript = null;
        enableTrancript = <div><Switch
            checked={element.transcript === undefined ? false : element.transcript}
            color="primary"
            onChange={() => {element.transcript = !element.transcript;
            this.setState({inputFiles: this.state.inputFiles})}}/></div>

        inputListItems.push(
            <ListItem
                key={inputListItems.length}>
                    <Avatar                 onClick={() => {if (element.type == "folder") {console.log("shell open item"); shell.openItem(element.path)};}}
> {icon} </Avatar>

                    <ListItemText
                    primary={element.path} secondary={element.type}
                    />

                    
                    <FormGroup>
                        <FormControlLabel
                        control = {enableFast5Extract === null ? <div></div> : enableFast5Extract}
                        label = {enableFast5Extract === null ? "" : "Re-Extract"}/>

                        <FormControlLabel
                        control={enableTrancript === null ? <div></div> : enableTrancript }
                        label = "Transcript"/>
                    </FormGroup>
                    
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


    //console.log("JSON HAS "+JSON.stringify(contaminants))
    //console.log("References "+self.state.inputRefs)

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



                    {element["protected"] ?
                        <div></div>
                        :
                        <IconButton
                            aria-label="Delete"
                            color="primary"
                            //onClick={() => delete contaminants[k]}
                            onClick={() => self.handleRefPathDelete(element)}>
                        <DeleteIcon/>
                    </IconButton>}

                    <Switch
                        checked={element.enabled}
                        color="primary"
                        onChange={() => {element.enabled = !element.enabled;
                        this.setState({inputRefs: this.state.inputRefs})}}/>

            </ListItem>
        )
    })





    // File List Saving Fastq
    var inputSaveItems: any = [];

    // element refering to References, idx Reference_Index, saveFiles = JSON
    this.state.inputRefs.forEach((element, idx) => {

        if (element.enabled){

        var innerSaveItems: any = [];

        if (this.state.saveFiles[element.path] === undefined) {
            this.state.saveFiles[element.path] = {aligned: {}, unaligned: {}};
        }


        // inner element referring to Files, inneridx File_index
        this.state.inputFiles.forEach((innerElement, innerIdx) => {

            var icon = <Icon>insert_drive_file</Icon>;
            if (innerElement.type == "folder") {icon = <Icon>folder_open</Icon>;}


            if (this.state.saveFiles[element.path]['aligned'][innerElement.path] === undefined) {
                this.state.saveFiles[element.path]['aligned'][innerElement.path] = false;
            }

            if (this.state.saveFiles[element.path]['unaligned'][innerElement.path] === undefined) {
                this.state.saveFiles[element.path]['unaligned'][innerElement.path] = false;
            }

            innerSaveItems.push(
                <ListItem
                    key={innerSaveItems.length}>

                    <Avatar>
                        {icon}
                    </Avatar>

                    <ListItemText
                        primary={path.basename(innerElement.path)}
                        secondary={innerElement.type}/>

                            <Switch
                                value={String(this.state.saveFiles[element.path]['aligned'][innerElement.path])}
                                color="primary"
                                onChange={() => {
                                    this.state.saveFiles[element.path]['aligned'][innerElement.path] = !this.state.saveFiles[element.path]['aligned'][innerElement.path];
                                    this.forceUpdate();}}/>
                                    aligned


                            <Switch
                                value={String(this.state.saveFiles[element.path]['unaligned'][innerElement.path])}
                                color="primary"
                                onChange={() => {
                                    this.state.saveFiles[element.path]['unaligned'][innerElement.path] = !this.state.saveFiles[element.path]['unaligned'][innerElement.path];
                                    this.forceUpdate();}}/>
                                    not aligned
                    </ListItem>
            )
        });


        inputSaveItems.push(
            <ListItem
                key={inputSaveItems.length}>
                    <Card
                    style={{width: '100%'}}>
                        <CardHeader
                            title={path.basename(element.path)}
                            subheader={"Extract the reads that either aligned or did not align to " + path.basename(element.path) + ""}/>
                                <List>{innerSaveItems}</List>
                    </Card>
            </ListItem>
        )



    }});

    if (this.state.inputRefs.length > 1){

        if (this.state.saveFiles['all'] === undefined) {
            this.state.saveFiles['all'] = {aligned: {}, unaligned: {}};
        }
        var innerSaveItems: any = [];

        this.state.inputFiles.forEach((innerElement, innerIdx) => {

            var icon = <Icon>insert_drive_file</Icon>;
            if (innerElement.type == "folder") {icon = <Icon>folder_open</Icon>;}

            if (this.state.saveFiles['all']['aligned'][innerElement.path] === undefined) {
                this.state.saveFiles['all']['aligned'][innerElement.path] = false;
            }

            if (this.state.saveFiles['all']['unaligned'][innerElement.path] === undefined) {
                this.state.saveFiles['all']['unaligned'][innerElement.path] = false;
            }


            innerSaveItems.push(
                <ListItem
                    key={innerSaveItems.length}>

                    <Avatar>
                        {icon}
                    </Avatar>

                    <ListItemText
                        primary={path.basename(innerElement.path)}
                        secondary={innerElement.type}/>

                            <Switch
                                value={String(this.state.saveFiles['all']['aligned'][innerElement.path])}
                                color="primary"
                                onChange={() => {
                                    this.state.saveFiles['all']['aligned'][innerElement.path] = !this.state.saveFiles['all']['aligned'][innerElement.path];
                                    this.forceUpdate();}}/>
                                    aligned


                            <Switch
                                value={String(this.state.saveFiles['all']['unaligned'][innerElement.path])}
                                color="primary"
                                onChange={() => {
                                    this.state.saveFiles['all']['unaligned'][innerElement.path] = !this.state.saveFiles['all']['unaligned'][innerElement.path];
                                    this.forceUpdate();}}/>
                                    not aligned
                    </ListItem>
            )
        });


        inputSaveItems.push(
            <ListItem
                key={inputSaveItems.length}>
                    <Card
                    style={{width: '100%'}}>
                        <CardHeader
                            titleTypographyProps={{color: "primary"}}
                            title={"All references"}
                            subheader={"Extract the reads that either aligned or did not align to all references from above."}/>
                                <List>{innerSaveItems}</List>
                    </Card>
            </ListItem>
        )

    }

    var saveFileList = <List>{inputSaveItems}</List>


    return [
    {
        header: "",
        headerName: "Read Files",
        label:
            <div>
                <Typography gutterBottom>
                    Sequ-into provides an easy and quick overview on what your sequenced reads truly consist of.
                </Typography>

                 <Typography gutterBottom>
                    Each chosen file will be handled separately. This is also true if you upload the same file twice. If you wish to examine certain reads together, e.g. because they stem from
                    the same experiment, make sure to save them in a folder and upload that folder via <em>Choose Directory</em>. In order to analyse a single file, upload it via <em>Choose File</em>.
                 </Typography>

                 <Typography gutterBottom>
                    As soon as you have uploaded your files an output directory will be generated. At the bottom of the page you have the option to change that directory simply by clicking on the text.
                 </Typography>

                 <Typography gutterBottom>
                    Click <em>Next</em> to proceed.
                 </Typography>

                 <Typography gutterBottom>
                    <Button
                                variant="contained"
                                size="small"
                                onClick={() => {shell.openItem( path.join(this.getDataPath(), "windows_ubuntu_install.bat"))}}
                                style={{
                                    marginBottom: "20px",
                                    marginRight: "50px",
                                    marginLeft: "50px"}}>

                                Setup WSL Environment&nbsp;
                                <Icon>chrome_reader_mode</Icon>
                            </Button>
                 </Typography>
            </div>,
        
        alarmlabel: 
        
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
            Choose your FastQ files/directories or Fast5 directories
        </div>,


        topimgPath: 'sequinfo_neg.jpg',

        imgPath: 'step1.png',

        content:
            <div style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginBottom: "10px",
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
                                Choose File
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
                    style={{
                        marginTop: "5px",
                        marginBottom: "20px" }}>
                    <CardContent>
                        <div>
                            <TextField
                                id="standard-full-name"
                                label="Output directory:"
                                helperText="Change the default output directory or enter your own by clicking on the textfield."
                                value={this.state.outputDir}
                                fullWidth
                                onChange={this.handleOutputDirChange('outputDir')}
                                margin="normal"/>
                        </div>
                    </CardContent>
                </Card>

        </div>
      },


      {
        header: "",
        headerName: "References",

        label:
            <div>
                <Typography gutterBottom>
                    To check what your reads truly consist of you need a reference against which the reads will be mapped. The reference might be a possible contamination,
                    such as E. Coli, or a known genome that your reads ought to be representing. You can use RNA as well as DNA sequences, as long as they are in the FastA Format. You will find sequences for example on NCBI.
                </Typography>

                 <Typography gutterBottom>
                    Click on <em>Choose Reference</em> to choose yonpm ur reference files. You can selected as many files as you wish. These files will still be present after you used <em>Reset</em>, but are deleted when you close the application.
                    If you work with certain references repeatedly they can also be saved in the app to make them available every time - even after you closed sequ-into. For this, choose simply <em>Save Contaminants</em>. Your own references can always be deleted from sequ-into later on, just click the trash icon to do so.
                 </Typography>

                 <Typography gutterBottom>
                    Keep in mind that calculation time increases with file size and file quantity! Consider using the switches behind each reference to turn them off if you don't need them for your current run. They will still be available after you used <em>Reset</em>.
                 </Typography>

                 <Typography gutterBottom>
                    Click <em>Start</em> to run the calculations.
                 </Typography>
            </div>
            ,
        
        alarmlabel:
            <div
                style={{
                    verticalAlign: "middle",
                    alignItems: "center" }}>


                    <Typography component="span" color="secondary">
                        Calculations can take several minutes to complete, during that the app might become not responsible.
                    </Typography>


                    <div 
                        style={{
                            verticalAlign: "middle",
                            display: "inline-flex"}}>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                        </svg>

                        <Typography component="span">
                            Choose your FastA files.&nbsp;
                        </Typography>
                            
                    </div>
            </div>,

        topimgPath: 'sequinfo_neg.jpg',

        imgPath: 'step2.png',

        content:
            <div
                style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginBottom: "20px"}}>
                <Card>
                    <CardActions>
                        <Button
                            variant="contained"
                            color="default"
                            component="label"
                            style={{ marginTop: "10px" }}
                            onClick={() => this.handleRefPath("file")}>
                                Choose Reference
                                <Icon>attach_file</Icon>
                        </Button>
                        <Button
                            variant="contained"
                            color="default"
                            component="label"
                            style={{ marginTop: "10px" }}
                            onClick={() => this.saveContaminants()}>
                                Save Contaminants
                                <Icon>attach_file</Icon>
                        </Button>
                    </CardActions>

                    <CardContent>
                        {this.state.showProgress ? <LinearProgress /> : <div></div>}
                        {inputRefList}
                    </CardContent>

                </Card>
            </div>,

        buttonAction: () => {
            var self = this
            this.setState({ showProgress: true })

            this.render()
           
            var myFunction = function() {
                self.startPython();
            }

            window.setTimeout(myFunction);
        }
    },



    {
        header: "",
        headerName: "Results",

        label:
        <div>

                <Typography gutterBottom>
                    On this page you will find two things: the statistical overview on how your reads mapped to the reference(s)
                    and the possibility to extract and save only those filtered reads you need for your downstream analysis.
                </Typography>

                 <Typography gutterBottom>
                    Results and saving options are categorized by reference and file/directory.
                 </Typography>

                 <Typography gutterBottom>
                    <em>Contamination Results</em> are first shown in a table. This is a statistical overview of your run per reference and file/directory. 
                    These statistics are also visualized below in two <em>pie charts</em>.
                    Additionly, a <em>bar plot</em> shows you how often a certain read length was found in your file/directory of your sequencing experiment.
                    Consider these informations as an indicator of your sequencing quality. 
                 </Typography>

                 <Typography gutterBottom>
                    <em>Extract Reads</em> allows you to filter each file/direcory you uploaded by either the single references separately or by all references at once.
                    For example, if you turn on the <em>aligned switch</em> for ecoli_k12_mg1655.fasta and your first FastQ file and click <em>Save</em> you will find a new FastQ file in
                    your output directoy that contains only those reads of your first file that mapped to the ecoli_k12_mg1655.fasta sequence.
                    The <em>not aligned switch</em> works respectively.
                 </Typography>

   

            </div>,


            alarmlabel:
            <div
                style={{
                    verticalAlign: "middle",
                    alignItems: "center" }}>


                    <Typography component="span" color="secondary">
                        Saving can take several minutes to complete, during that the app might become not responsible.
                    </Typography>
                    
                    

                    <div 
                        style={{
                            verticalAlign: "middle",
                            display: "inline-flex"}}>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                        </svg>

                        <Typography component="span">
                            You will find all figures and saved files in your chosen output directory.
                        </Typography>
                            
                    </div>
            </div>,

        topimgPath: 'sequinfo_neg.jpg',

        imgPath: 'step3.png',

        content:
            <div>

                <Card>
                    <CardContent>
                        <p>Contamination Results:</p>
                        {this.state.resultTable}
                    </CardContent>
                </Card>

            

                <Card
                    style={{ marginTop: this.largeMargin }}>
                        <CardContent>
                            <p>Extract Reads:</p>
                            {saveFileList}
                        </CardContent>

                        <Button
                            variant="contained"
                            size="small"
                            disabled={this.state.showProgress2}
                            onClick={() => {this.startPythonSave()}}
                            style={{
                                marginBottom: "20px",
                                marginRight: "50px",
                                marginLeft: "50px"}}>

                            Save Files&nbsp;
                            <Icon>save</Icon>
                        </Button>
                </Card>


                <div
                    style={{ 
                        marginTop: this.largeMargin,
                        marginBottom: "25px",
                        marginRight: "50px"}}>
                            <Button
                                variant="contained"
                                onClick={() => {this.handleBack(true)}}
                                size="large"
                                style={{
                                    backgroundColor: 'red',
                                    color: "white",
                                    marginRight: "50px"
                                     }}>
                                        Reset&nbsp;
                                        <Icon>bubble_chart</Icon>
                            </Button>
                </div>
            </div>,
      },
    ]; // return
  } // getStepperSteps()


    // set correct next step in stage
    handleNext = () => {

        var newstep = this.state.activeStep + 1;
        if (newstep >= 2)
        {
            newstep=2;
        }

        this.setState(
            prevState => ({
                activeStep: newstep,
            }));
    };

    // correct backwards step
    handleBack(reset:boolean) {
        
        this.state.showProgress = false
        this.setState({ showProgress: this.state.showProgress })
        this.render()

        this.state.showProgress2 = false
        this.setState({ showProgress2: this.state.showProgress2 })
        this.render()

        var newStep = this.state.activeStep-1;


        if ((reset) || (newStep <0))
        {
            newStep = 0;
        }

        this.setState(
            {
                activeStep: newStep,
            });
    };


    // ### STEP 1 ###
    handleSeqPath(upType: String) {
        var self = this;
        if (upType == "file") {

            dialog.showOpenDialog(
                // TODO update for .fast5
                {filters: [
                    {
                        name: 'FastQ',
                        extensions: ['fastq', 'FASTAQ', 'fq', 'FQ']
                    }
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
                        });

                    });

                    
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
                
                
                dirName.forEach((element: any) => {
                    self.state.outputDir = path.join(element,'tmp')
                    self.state.inputFiles.push({
                        path: element,
                        type: upType,
                    });
                });

                    
                self.setState({ inputFiles: self.state.inputFiles, outputDir: self.state.outputDir })
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



    // ### STEP 2 ###
    handleRefPath(upType: String) {
        var self = this;

        if (upType == "file") {
                dialog.showOpenDialog(
                    { filters: [
                        {
                            name: 'Fasta',
                            extensions: ['fasta', 'FASTA', 'fa', 'FA']
                        }
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

                        //console.log(self.state.inputRefs)
                        self.setState({ inputRefs: self.state.inputRefs })
                    }
                )
            } else
            {
            }
    }

    loadContaminants(){

        var self=this;
        console.log(process.cwd())
        fs.readFile(path.join(self.getDataPath(), "contaminants.json"), 'utf8', (err:any, data:any) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been loaded " + "../contaminants");
            console.log(data);

            var jsonData = JSON.parse(data);
            console.log(jsonData);

            self.setState({inputRefs: jsonData});
        });
    }

    saveContaminants()
    {

        var self=this;
        console.log(process.cwd())

        var textJSON =  JSON.stringify(this.state.inputRefs);

        fs.writeFile(path.join(self.getDataPath(), "contaminants.json"), textJSON, 'utf8', (err:any) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been written " + "../contaminants");
            console.log(this.state.inputRefs);
        });
    }


  handleRefPathDeleteJSON(key: any) {
    delete contaminants[key];
    var self=this;
    //console.log(JSON.stringify(contaminants))
    fs.writeFile(path.join(self.getDataPath(), "contaminants.json"), JSON.stringify(contaminants), (err:any) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
        self.loadContaminants();
    });

  }

  handleRefPathDelete(element: any) {
    var index = this.state.inputRefs.indexOf(element)
    //console.log(index)
    if (index >= 0) {
      this.state.inputRefs.splice(index, 1)
    }
    this.setState({ inputRefs: this.state.inputRefs })

    // save inputRefs to json

  }



  handleOutputDirChange = (outputDir:any) => (event:any) => {
    this.setState({outputDir: event.target.value,});
  };




    transformedPaths: any = {};

    normalizePath( inpath: string )
    {

        var outPath = inpath;

        if (os.platform() == "win32")
        {
            outPath = inpath.replace(/\\/g, "/");
            outPath = outPath.replace("C:/", "/mnt/c/")

            this.transformedPaths[outPath] = inpath;
        }

        return outPath;
    }

    getContamToolPath()
    {
        var sysPath = path.join(this.getDataPath(), "ContamTool.py");

        if (os.platform() == "win32")
        {
            sysPath = this.normalizePath(sysPath);
        }

        return sysPath;
    }

    convertUnix2Win(inpath: string)
    {

        // /mnt/c/test/file.ext
        var outpath = inpath.replace(/\//g, "\\");
        // \mnt\c\text\file.ext
        outpath = outpath.replace(/\\mnt\\/, "");
        // c\text\file.ext
        outpath = outpath.charAt(0) + ":" + outpath.substr(1, outpath.length)

        console.log(inpath);
        console.log(outpath);

        return outpath;
    }

   // ### STEP 4 ###

        getAllReadFilesFromDir(dirPath: any)
        {
            var self = this;
            var allFilesInDir = fs.readdirSync(dirPath);
            var reportedFiles:any = [];

            allFilesInDir.forEach((myFile:any) => {
                if(myFile.toUpperCase().endsWith("FASTQ") || myFile.toUpperCase().endsWith("FQ")){

                    var pathToFile = self.normalizePath(path.join(dirPath, myFile));

                    reportedFiles.push(pathToFile);
                }
            });

            return reportedFiles;
        }


       async startPython() {
      
        var self = this;

        self.state.contamResult = {};


        var processFilesForElement:any = {};
        var processFilesTranscript:any = [];

        self.state.inputFiles.forEach(element => {

            console.log("TRANSCRIPT "+element.transcript);
            console.log("FAST5 "+element.forceFast5Extract);

            var stats = fs.lstatSync(element.path)
            if (stats.isDirectory()){

                processFilesForElement[element.path] = [];

                var allFoundFiles: any = self.getAllReadFilesFromDir(element.path);

                if ((allFoundFiles.length == 0) || (element.forceFast5Extract == true))
                {
                    console.log("Extracting reads" + element.path);
                    // extract reads
                    self.extractReadsForFolder(element.path);
                    // get extracted reads
                    allFoundFiles = self.getAllReadFilesFromDir(element.path);
                }

                console.log("All found files")
                console.log(allFoundFiles)

                processFilesForElement[element.path] = allFoundFiles;
                if (element.transcript){
                    processFilesTranscript = processFilesTranscript.concat(allFoundFiles);
                }
               
            }else{
                processFilesForElement[element.path] = [self.normalizePath(element.path)];
                if(element.transcript){
                    processFilesTranscript.push(element.path)
                }
                
            }
            
        });

        var processFileKeys = Object.keys(processFilesForElement);
        var totalProcessRuns:any = processFileKeys.length;
        var finishedFileKeys:any = [];
        var processError = false;

        console.log(processFilesForElement)

        processFileKeys.forEach( (elemPath: any) => {

            if (processError)
            {
                return;
            }

            var useInputFiles = processFilesForElement[elemPath].join(" ");

            var allFiles: any = [];
            processFilesForElement[elemPath].forEach((x:any) => {
                allFiles.push(x)
            })

            console.log(allFiles);

            var command = self.getContamToolPath() + " --reads " + useInputFiles + " ";
            if (processFilesTranscript.length>0){
                command = command + "--transcript " + processFilesTranscript.join(" ") +" "
            }
            command = command + "--cont ";

            var refFiles: any = [];

            self.state.inputRefs.forEach(element => {if (element.enabled)
                    {
                        console.log(element);
                        if (element.appfile === true)
                        {
                            var inref = self.normalizePath(path.join(self.getDataPath(), element.path));
                            command = command + inref +" "
                            allFiles.push(inref);
                            refFiles.push(inref);

                        } else {

                            var inref = self.normalizePath(element.path);
                            command = command + inref +" "
                            allFiles.push(inref);
                            refFiles.push(inref);

                        }
                    }
            })

            let elem_prefix = allFiles.map((x:any) => self.makeExportPath(x)).join("_");
            console.log(elem_prefix);

            command = command + "--o " + self.normalizePath(self.state.outputDir) + " "
            command = command + "--prefix " + elem_prefix

            var splitted_command = command.split(" ");
        //console.log(command+" command")

            var child = null;
            let processOutput = "";

            var program = "";
            var programArgs = null;
            var useShell = true;

            if (os.platform() == "win32")
            {
                var splitCmd = ["-i", "-c", "python3 " + command];

                program = "bash";
                programArgs = splitCmd;
                useShell = false;

                console.log("Windows Version")
                console.log(splitCmd);

            } else {

                var splitted_command = command.split(" ");

                program = "python3";
                programArgs = splitted_command;
                useShell = true;

                console.log("Unix Version")
                console.log(splitted_command);
            }

            if (os.platform() == "darwin")
            {
                var np = shellPath.sync();
                process.env.PATH = np;
            }

            child = spawnSync(program, programArgs,{
                cwd: process.cwd(),
                env: process.env,
                stdio: 'pipe',
                encoding: 'utf-8',
                shell: useShell
            })

            console.log(child)

            processOutput = child.output[1];
            //console.log(processOutput);

            if (child.status != 0)
            {
                self.setState({resultTable:
                <Card>
                    <CardContent>
                        <Typography color='secondary'>{processOutput}</Typography>
                        <Typography color='secondary'>{child.output[2]}</Typography>
                    </CardContent>
                </Card>
                })

                processError=true;
                self.handleNext();

                return;
            }

            try {
                var newContamRes = JSON.parse(processOutput);
                console.log("new contam res")
                console.log(newContamRes)

                Object.keys(newContamRes).forEach( rkey => {
                    var singleContamRes = newContamRes[rkey];
                    singleContamRes['fastq'] = processFilesForElement[elemPath];

                    self.state.contamResult[elem_prefix+"_"+rkey] = singleContamRes;
                });

                console.log("set contamResult")
                console.log(self.state.contamResult)

                self.setState({contamResult:  self.state.contamResult})


            } catch (e) {
                console.log("python error")

                self.setState({resultTable: <div>
                    <Card>
                        <CardContent>
                            <Typography color='secondary'>{processOutput}</Typography>
                            <Typography color='secondary'>{child.stderr}</Typography>

                        </CardContent>
                    </Card>
                    </div>})

                self.handleNext();
                return;
            }

        })

        if (processError)
        {
            return;
        }

        if (totalProcessRuns == finishedFileKeys.length)
        {
            console.log("result :D")
        }

        self.makeContamResultTable()
        self.handleNext();

        }










        startPythonSave() {

            var self = this



            self.state.inputRefs.forEach(refElement => {


                if ((refElement != "all") && (refElement.enabled)) {

                    
                    Object.keys(self.state.saveFiles[refElement.path]['aligned']).forEach((fileElement:any) => {
                        var command = self.getContamToolPath() + " ";


                        var doAligned = self.state.saveFiles[refElement.path]['aligned'][fileElement];
                        var doUnaligned = self.state.saveFiles[refElement.path]['unaligned'][fileElement];

                        if( doAligned || doUnaligned){

                            var refElementPath = "";
                            if (refElement.appfile === true)
                            {
                                refElementPath = self.normalizePath(path.join(self.getDataPath(), refElement.path));

                            } else {
                                refElementPath = self.normalizePath(refElement.path);
                            }

                            var readsPath = self.normalizePath(fileElement)

                            command += "--cont " + refElementPath + " "
                            command += "--reads " + readsPath + " "
                            command += "--o " + self.normalizePath(self.state.outputDir) + "/extractedFiles" + " "
                            command += "--no_images "

                            var extractPrefix = self.makeExportPath(readsPath) + "_"  + self.makeExportPath(refElementPath)

                            command += "--prefix " + extractPrefix + " " 
                            command += "--extract_prefix " + extractPrefix + " "

                            if (doAligned)
                            {
                                command += "--extract_aligned " + refElementPath + " "
                            }

                            if (doUnaligned)
                            {
                                command += "--extract_not_aligned " + refElementPath + " "
                            }

                            console.log("+++ +++ +++ Command SaveFiles: " + command)


                            // python
                            var child = null;
                            var program = "";
                            var programArgs = null;

                            if (os.platform() == "win32")
                            {
                                program = "bash";
                                programArgs = ["-i", "-c", "python3 " + command];

                                console.log("Windows Version")
                                console.log(programArgs);

                            } else {

                                program = "python3";
                                var splitted_command = command.split(" ");
                                programArgs = splitted_command;

                                console.log("Unix Version")
                                console.log(programArgs);
                            }

                            if (os.platform() == "darwin")
                            {
                                var np = shellPath.sync();
                                process.env.PATH = np;
                            }

                            child = spawnSync(program, programArgs,{
                                cwd: process.cwd(),
                                env: process.env,
                                stdio: 'pipe',
                                encoding: 'utf-8'
                            })

                            console.log(`stdout:`);
                            console.log(child);                        }
                    })

                }

            })


            // Intersection all references
            var cont = "--cont "
            var alig = "--extract_aligned "
            var notal = "--extract_not_aligned "


            self.state.inputRefs.forEach(refElement => {
                if (refElement.enabled) {

                    var refElementPath = "";
                    if (refElement.appfile === true)
                    {
                        refElementPath = self.normalizePath(path.join(self.getDataPath(), refElement.path));
                    } else {
                        refElementPath = self.normalizePath(refElement.path);
                    }

                    cont += refElementPath + " "
                    alig += refElementPath + " "
                    notal += refElementPath + " "
                }
            })

            
            if ('all' in self.state.saveFiles)
            {
                Object.keys(self.state.saveFiles['all']['aligned']).forEach((fileElement:any) => {
                    var command = self.getContamToolPath() + " ";


                    var doAligned = self.state.saveFiles["all"]['aligned'][fileElement];
                    var doUnaligned = self.state.saveFiles["all"]['unaligned'][fileElement];

                    if( doAligned || doUnaligned){

                        var readsPath = self.normalizePath(fileElement);
                        command += "--reads " + readsPath + " "
                        command += "--o " + self.normalizePath(path.join(self.state.outputDir, "/extractedFiles")) + " "

                        var extractPrefix = self.makeExportPath(readsPath) + "_all"

                        command += "--prefix " + extractPrefix + " "
                        command += "--extract_prefix " + extractPrefix + " "

                        command += "--no_images "
                        command = command + cont

                        if (doAligned)
                        {
                            command += alig
                        }

                        if (doUnaligned)
                        {
                            command += notal
                        }

                        // python
                        var child = null;
                        var program = "";
                        var programArgs = null;

                        if (os.platform() == "win32")
                        {
                            program = "bash";
                            programArgs = ["-i", "-c", "python3 " + command];

                            console.log("Windows Version")
                            console.log(programArgs);

                        } else {

                            program = "python3";
                            var splitted_command = command.split(" ");
                            programArgs = splitted_command;

                            console.log("Unix Version")
                            console.log(programArgs);
                        }

                        if (os.platform() == "darwin")
                        {
                            var np = shellPath.sync();
                            process.env.PATH = np;
                        }

                        child = spawnSync(program, programArgs,{
                            cwd: process.cwd(),
                            env: process.env,
                            stdio: 'pipe',
                            encoding: 'utf-8'
                        })

                        console.log(`stdout:`);
                        console.log(child);
                    }
                });
            }
    }

    getBasename(inpath:string)
    {
        return path.basename(inpath, path.extname(inpath));
    }

    makeExportPath(inpath: string)
    {

        var outpath = path.basename(inpath, path.extname(inpath));
        var outpath = outpath.replace(/[^a-zA-Z0-9]/g, "_").replace(/__/g, "_")

        return outpath;

    }

    numberFormat(n: number, suffix:string, decimals:number = 3)
    {
        var intVal = Math.floor(n);
        var remVal = n-intVal;

        var intSVal = String(intVal);
        var remSVal = remVal.toFixed(decimals);

        intSVal = intSVal.replace(/./g, function(c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
        });

        remSVal = remSVal.substr(3);

        var retVal = intSVal;

        if (remVal > 0.0)
        {
            retVal += "." + remSVal;
        }
     
        return retVal + suffix;
    }

    makeContamResultTable()
    {
        var resultTable = <div></div>;
        var self=this;


        var resultItems: any = [];
        var resultList = <List> {resultItems} </List>;

        
        Object.keys(self.state.contamResult).forEach((elemKey: any) => {
            //SPONGEBOB this was inputRefs, but shouldn't it be contamResult?

            var element = self.state.contamResult[elemKey];
            console.log(element);

            var basesPieUrl = element.basesPie;
            var readLengthPlotUrl = element.readLengthPlot;
            var readsPieUrl = element.readsPie;
            var readLengthSmallPlotUrl = element.readLengthPlotSmall;
            var overviewUrl = element.overviewUrl;

            if (os.platform() == "win32")
            {
                basesPieUrl = self.convertUnix2Win(element.basesPie);
                readLengthPlotUrl = self.convertUnix2Win(element.readLengthPlot);
                readLengthSmallPlotUrl = self.convertUnix2Win(element.readLengthPlotSmall);
                readsPieUrl = self.convertUnix2Win(element.readsPie);
                overviewUrl = self.convertUnix2Win(element.overviewUrl);
            }


            if (true){

                var sContamName = elemKey;

                console.log("ELEMENT CARD")
                console.log(elemKey)
                console.log(self.transformedPaths)
                console.log(elemKey in self.transformedPaths ? self.transformedPaths[sContamName] : sContamName)

                console.log(element["fastq"])
                console.log(element["fastq"].map((x:any) => {path.basename(x)}))

                console.log(element["fastq"].map((x:any) => {
                    console.log(x)
                    console.log(path.basename(x))
                    console.log(path.extname(x))
                }))

                console.log(element["fastq"].map((x:any) => {path.basename(x)}).join(", "))


                if (sContamName in self.transformedPaths)
                {
                    sContamName = self.transformedPaths[sContamName];
                }

                sContamName = self.getBasename(sContamName);




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
                            <TableCell numeric>{this.numberFormat(element["totalReads"], "", 0)}</TableCell>
                            <TableCell numeric>100%</TableCell>
                        </TableRow>
                        
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Aligned reads
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["alignedReads"], "", 0)}</TableCell>
                            <TableCell numeric>{this.numberFormat(100*element["alignedReads"]/element["totalReads"],"%")}</TableCell>
                        </TableRow>
                       
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Unaligned reads
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["totalReads"]-element["alignedReads"], "", 0)}</TableCell>
                            <TableCell numeric>{this.numberFormat((100*(element["totalReads"]-element["alignedReads"])/element["totalReads"]), "%")}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Bases
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["totalBases"], "", 0)}</TableCell>
                            <TableCell numeric>100%</TableCell>
                        </TableRow>
                        
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Alignment bases
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["alignmentBases"], "", 0)}</TableCell>
                            <TableCell numeric>{this.numberFormat(100*element["alignmentBases"]/element["totalBases"], "%")}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Aligned bases
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["alignedLength"], "", 0)}</TableCell>
                            <TableCell numeric>{this.numberFormat(100*element["alignedLength"]/element["totalBases"],"%")}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                            <TableCell component="th" scope="row">
                            Unaligned bases
                            </TableCell>
                            <TableCell numeric>{this.numberFormat(element["totalBases"]-element["alignedLength"], "", 0)}</TableCell>
                            <TableCell numeric>{this.numberFormat(100*(element["totalBases"]-element["alignedLength"])/element["totalBases"], "%")}</TableCell>
                        </TableRow>

                        
                    </TableBody>
                </Table>;
                



                resultItems.push(

                    <ListItem
                        key={resultItems.length}>
                
                
                        <Card
                            style={{width: '100%'}}>
                    
                    
                    <CardContent>

                        <div style={{display: "inline-flex"}}>
                        <Typography component="span">Results for reference&nbsp;</Typography>
                        <Typography component="span"> </Typography>
                        <Typography component="span" color="secondary">
                            {element["refs"].map((x:any) => {return path.basename(x)}).join(", ")}
                        </Typography>
                        <Typography component="span"> </Typography>
                        <Typography component="span">&nbsp;with reads&nbsp;</Typography>
                        <Typography component="span"> </Typography>
                        <Typography component="span" color="secondary">
                            {element["fastq"].map((x:any) => {return path.basename(x)}).join(", ")}
                        </Typography>
                        </div>

                        {tablePart}

                        <Gallery
                                heading={"Plots"}
                                subheading={null}
                                showThumbnails={false}
                                images={[
                                    {src: readsPieUrl, caption: "Read Pie"},
                                    {src: basesPieUrl, caption: "Bases Pie"},
                                    {src: readLengthPlotUrl, caption: "Read Lengths"},
                                    {src: readLengthSmallPlotUrl, caption: "Read Lengths (<10k)"},
                            ]}/>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {shell.openItem( overviewUrl )}}
                            style={{
                                marginBottom: "20px",
                                marginRight: "50px",
                                marginLeft: "50px"}}>

                            Open HTML report&nbsp;
                            <Icon>chrome_reader_mode</Icon>
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {shell.openItem( this.state.outputDir )}}
                            style={{
                                marginBottom: "20px",
                                marginRight: "50px",
                                marginLeft: "50px"}}>

                            Open tmp Folder&nbsp;
                            <Icon>folder_special</Icon>
                        </Button>

                    </CardContent>

                </Card>

                </ListItem>
                
                
                );
            }
        })

        resultList = <List>{resultItems}</List>
        resultTable = <div>
                            {resultList}
                    </div>;

        
        console.log("Submitting resultTable");
        this.setState({resultTable: resultTable});
        this.forceUpdate();
    }

    extractReadsForFolder(folderPath: string)
    {
        var nfolderPath = this.normalizePath(folderPath)

           var command = this.getExtractReadsToolPath() + " --count 1000 --folder " + nfolderPath;

           var program = "";
           var programArgs = null;
           var useShell = true;

           if (os.platform() == "win32")
           {
               var splitCmd = ["-i", "-c", "python3 " + command];

               program = "bash";
               programArgs = splitCmd;
               useShell = false;

               console.log("Windows Version")
               console.log(splitCmd);

           } else {

               var splitted_command = command.split(" ");

               program = "python3";
               programArgs = splitted_command;
               useShell = true;

               console.log("Unix Version")
               console.log(splitted_command);
           }


	    if (os.platform() == "darwin")
            {
                var np = shellPath.sync();
                process.env.PATH = np;
            }
           

           var child = spawnSync(program, programArgs,{
               cwd: process.cwd(),
               env: process.env,
               stdio: 'pipe',
               encoding: 'utf-8',
               shell: useShell
           })

           console.log(child)

   }

    getExtractReadsToolPath()
   {
       var sysPath = path.join(this.getDataPath(), "extract_fast5.py");

       if (os.platform() == "win32")
       {
           sysPath = this.normalizePath(sysPath);
       }

       return sysPath;
   }
}

export default TextMobileStepper;

