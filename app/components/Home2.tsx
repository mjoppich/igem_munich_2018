import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Card, CardActions } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CardContent from '@material-ui/core/CardContent';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { exec } from 'child_process';



var app = require('electron').remote;
var dialog = app.dialog;




class TextMobileStepper extends React.Component<{}, {

  activeStep: any,
  inputFiles: Array<any>,
  showProgress: boolean
}>


{
  state = {
    activeStep: 0,
    inputFiles: new Array(),
    showProgress: false
  };




  handleSeqPath(upType: String) {
    var self = this;

    if (upType == "file") {
      dialog.showOpenDialog((fileNames: any) => {
        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
          console.log("No file selected");
          return;
        }

        fileNames.forEach((element: any) => {
          self.state.inputFiles.push({
            path: element,
            type: upType,
          });

        });

        console.log(self.state.inputFiles)
        self.setState({ inputFiles: self.state.inputFiles })

      });
    } else {

    }
  }







  handleSeqPathDelete(element: any) {
    var index = this.state.inputFiles.indexOf(element)
    if (index >= 0) {
      this.state.inputFiles.splice(index, 1)
    }
    this.setState({ inputFiles: this.state.inputFiles })
  }









  getStepperSteps() {


    var self = this;
    var inputListItems: any = [];


    this.state.inputFiles.forEach(element => {

      var icon = <Icon>insert_drive_file</Icon>;

      if (element.type == "folder") {
        icon = <Icon>folder_open</Icon>;
      }


      inputListItems.push(
        <ListItem key={inputListItems.length}>
          <Avatar>
            {icon}
          </Avatar>
          <ListItemText primary={element.path} secondary={element.type} />
          <IconButton aria-label="Delete" color="primary" onClick={() => self.handleSeqPathDelete(element)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      )
    });




    var inputFileList = <List>
      {inputListItems}
    </List>;



    return [
      {

        
        label: <div>
          Even if you think you did the wetlab part right, your drylab master will tell you, something is screwed up.
          Nanopore sequencing of bacteriophages was one of the important topics that we worked with. The analysis of the MinION
          sequencing data was orientated to build one consensus sequencing out of all sequences (reads) gained by sequencing of each DNA sample.
          This consensus sequence can also be used to determine the origin and genetic makeup of the bacteriophage.
          Sequencing results of five different phages (T4, T7, NES, 3S, FFP) shown high contamination by E.coli that was not seen on the gel in the lab.
          In order to build quality control of each sequencing and analyse rational only the data without forein DNA we provide a tool to check
          for contamination that does not require any data preprocessing and is in principle suitable for every sequencing method that will give standard
          .fastq output format. This tool is also helpful by building the consensus sequence, because there is an option to extract only sequences (reads)
          that were not identified as part of contamination DNA sample.
      <div></div>
          <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" /></svg>
            Please pay attention to this sign in case of any problems or questions.
      </div>
        </div>,
        header: "Welcome to the contamination tool SequInto",
        imgPath: '../sequinfo_logo.jpeg',
        topimgPath: '../sequinfo_neg.jpg',
        content: <div style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "10%" }}>
          <Button variant="contained" onClick={this.handleNext} size="large" style={{ backgroundColor: 'red', color: "white" }}>
            Start
      <Icon>bubble_chart</Icon>
          </Button>
        </div>
      },
      
      
      
      {
        header: 'Sequencing data',
        label: <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" /></svg>
          Please enter sequencing read file only in .fastq format!
      </div>,

        content: <div>

          <Card>
            <CardActions>
              <Button
                variant="contained"
                color="default"
                component="label"
                onClick={() => this.handleSeqPath("file")}
              >
                Upload File
            <Icon>attach_file</Icon>
              </Button>
              <Button
                variant="contained"
                color="default"
                component="label"
                onClick={() => this.handleSeqPath("folder")}
              >
                Upload Path
            <Icon>attach_file</Icon>
              </Button>
            </CardActions>

            <CardContent>

              {inputFileList}

            </CardContent>
          </Card>

        </div>,
        topimgPath: '../sequinfo_neg.jpg',
      },
      {
        header: 'Contaminations',
        label: <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" /></svg>
          Please enter each contamination file only in .fasta format!
      </div>,

        topimgPath: '../sequinfo_neg.jpg',
        content: <div>
          <Button variant="contained" color="default" component="label">
            Upload
          <Icon>attach_file</Icon>
            <input
              onChange={e => ((e != null) && (e.target != null) && (e.target.files != null)) ? console.log(e.target.files[0]) : console.log("no input file")}
              style={{ display: 'none' }}
              type="file"
            />
          </Button>
          <Card style={{ marginBottom: "50px", marginTop: "50px" }}>
            <CardContent>
              <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
                <span>Escherichia coli</span>
                <IconButton aria-label="Delete" color="primary">
                  <DeleteIcon />
                </IconButton>
              </div>
            </CardContent>

          </Card>
          <Card style={{ marginBottom: "50px" }}>
            <CardContent>
              <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
                <span>Homo Sapiens</span>
                <IconButton aria-label="Delete" color="primary">
                  <DeleteIcon />
                </IconButton>
              </div>
            </CardContent>
          </Card>
        </div>
      },
      {
        header: 'Summary',
        label: <div style={{ display: "inline-flex", verticalAlign: "middle", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" /></svg>
          Please check the correctness carefully!
      </div>,
        content: <div>
          <Card>
            <CardContent>
              <p>Inserted .fastq files of sequencing reads:</p>
              {inputFileList}
            </CardContent>
          </Card>
          {this.state.showProgress ? <div>
            <LinearProgress />
            <br />
            <LinearProgress color="secondary" />
          </div> : <div></div>}
        </div>,
        topimgPath: '../sequinfo_neg.jpg',
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
        header: 'Results',
        label: 'Statistics',
        topimgPath: '../sequinfo_neg.jpg',
        content: <div>
          <Button variant="contained" size="small" >
            Save
        <Icon>save</Icon>
          </Button>
          <div style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "10%" }}>
            <Button variant="contained" onClick={this.handleBack} size="large" style={{ backgroundColor: 'red', color: "white" }}>
              Reset
        <Icon>bubble_chart</Icon>
            </Button>
          </div>
        </div>
      },
    ];
  }















  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };



  handleBack = () => {
    this.setState(prevState => ({
      activeStep: 0,
      inputFiles: new Array(),
      showProgress: false,
    }));
  };




  startPython() {
    var self = this;

    // fetch all necessary input values

    // call python

    // when python finished, next
    exec('echo "bla"', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      var fakeRes: any = { "/Users/rita/iGEM/test/test2.sam": { "totalReads": 57, "alignedReads": 1, "totalBases": 81783, "alignmentBases": 667, "alignedLength": 698, "idAlignedReads": ["ee79aed7-d8a6-4f9c-9aef-f0100b590cfa"], "idNotAlignedReads": ["a1d0d393-d7ea-44e5-8708-a547c2160082", "8c106cce-b89b-42ae-b40e-825a0c14631e", "4a8b28f5-b69d-4476-9855-4149212a03a0", "1b1c423e-848a-483c-809d-3c4740f2d026", "b814f965-08e1-4339-8064-b3c050c6cea8", "e89b8826-d107-4dda-bb40-64175f8c7e2d", "1a3ee8a1-5a6d-421a-8401-3e40ee167b33", "1e3f4cad-2d13-4457-b15e-0a5db8b93d06", "85c5bd1f-c201-4cb5-a58a-de8b0bcbe248", "7c76eaeb-0173-4286-9c8f-ff5b0d079fc9", "77ca324d-54b4-4724-a8da-2d2fd4fd4912", "a175cd5c-d6d4-43af-92ee-36bc415120e4", "1b33da51-5c41-4798-a190-8c0c5b02c67f", "d5970734-ea15-4b93-aaf3-f19657a1afd8", "04b5b8ff-68eb-442d-abf0-e12b6e311bf1", "8729e569-46cd-4774-8e59-e085de0743ef", "7db9591d-4b6f-49e8-8eb0-45ce46b4b150", "5fc9ae0b-472d-4a54-a157-209fb452aa22", "315ea4b5-63a2-457f-9e39-978bf6014593", "7ca439bd-1746-41a8-8b5f-c006c7fddb85", "83adc14a-5013-4149-81e1-2c105c7cb421", "0e85dbce-a064-4e2e-aa1a-cecf989a02fb", "49df9768-2dd0-4b98-91bc-272b1143b2e2", "7d25bf84-b96d-42b6-aaaa-7cf7f6550119", "806bf992-65dc-43d5-8c58-96e1255bf0b8", "20eeb850-ac8d-4af6-9967-03293bb8da93", "eeb7b442-a989-48ed-ac46-68dde7ae5545", "8b412cd2-ec4a-4e02-98a8-f095afa6bcea", "303031e0-4fd2-4d6f-9f78-7ffc1c3bf53d", "d2f9f371-dc09-4092-a3b4-36a8ab741b2b", "76f680e6-d3b9-4e9e-8532-270c5ba1beaa", "4990a482-ff40-4479-b25b-c17ac24c0089", "3b7d88f7-70ca-4326-8a7c-c95de82df94a", "e206f459-fa54-41f8-91f7-e424e4b3509c", "42db4fed-5492-4779-9d30-0df8708d8efc", "d4284f0c-3033-4810-b288-297d7de602a7", "06a78346-c988-42a9-b994-55669201c229", "2dcbf92c-f67f-4e16-b08a-18f8f9292e5a", "6a0b37cc-1a51-4b71-ab7f-2d1514dca2c0", "3f4d693f-758b-417d-a49c-937124125b37", "119b3e1e-b3f1-4b8d-90f7-f081d35a4f77", "5d99e009-d3b6-4ce0-b3e4-afd4ac6a8f78", "cc543c96-d241-49df-86fc-bde932808c66", "1648a124-1572-4174-9d2a-1a7f0dd65aef", "cdf57a97-d1e8-4f86-a702-0ea0d649037a", "8ca76ac9-c3c7-4972-b5d7-06dcd1651564", "53cdb73d-5512-4109-bbb5-fdfca9af9688", "b78d8d83-eb6e-488a-b049-bd21019d0972", "8ea717dc-bda1-4fa6-84fa-8c9b7f4c3e13", "d2a915c4-dbd0-45c1-bbe2-05c705b755b8", "fe82d702-31eb-43b0-adef-e06eb46bef19", "62705c94-679a-40ce-ab01-fdf9d19e0727", "5085a3f8-7dbf-4420-a151-378e8930e331", "5a766eb6-ebda-4377-add4-3d130a08394a", "72bdb41d-ca7e-4787-bacc-da750d9652d3", "c071ca28-c26e-4601-9e0d-670199c41a29"] }, "/Users/rita/iGEM/test/test.sam": { "totalReads": 57, "alignedReads": 5, "totalBases": 81783, "alignmentBases": 7631, "alignedLength": 7511, "idAlignedReads": ["a1d0d393-d7ea-44e5-8708-a547c2160082", "4990a482-ff40-4479-b25b-c17ac24c0089", "119b3e1e-b3f1-4b8d-90f7-f081d35a4f77", "cc543c96-d241-49df-86fc-bde932808c66", "5a766eb6-ebda-4377-add4-3d130a08394a"], "idNotAlignedReads": ["ee79aed7-d8a6-4f9c-9aef-f0100b590cfa", "8c106cce-b89b-42ae-b40e-825a0c14631e", "4a8b28f5-b69d-4476-9855-4149212a03a0", "1b1c423e-848a-483c-809d-3c4740f2d026", "b814f965-08e1-4339-8064-b3c050c6cea8", "e89b8826-d107-4dda-bb40-64175f8c7e2d", "1e3f4cad-2d13-4457-b15e-0a5db8b93d06", "77ca324d-54b4-4724-a8da-2d2fd4fd4912", "85c5bd1f-c201-4cb5-a58a-de8b0bcbe248", "7c76eaeb-0173-4286-9c8f-ff5b0d079fc9", "1b33da51-5c41-4798-a190-8c0c5b02c67f", "a175cd5c-d6d4-43af-92ee-36bc415120e4", "1a3ee8a1-5a6d-421a-8401-3e40ee167b33", "d5970734-ea15-4b93-aaf3-f19657a1afd8", "04b5b8ff-68eb-442d-abf0-e12b6e311bf1", "8729e569-46cd-4774-8e59-e085de0743ef", "7db9591d-4b6f-49e8-8eb0-45ce46b4b150", "5fc9ae0b-472d-4a54-a157-209fb452aa22", "315ea4b5-63a2-457f-9e39-978bf6014593", "7ca439bd-1746-41a8-8b5f-c006c7fddb85", "83adc14a-5013-4149-81e1-2c105c7cb421", "0e85dbce-a064-4e2e-aa1a-cecf989a02fb", "49df9768-2dd0-4b98-91bc-272b1143b2e2", "7d25bf84-b96d-42b6-aaaa-7cf7f6550119", "806bf992-65dc-43d5-8c58-96e1255bf0b8", "20eeb850-ac8d-4af6-9967-03293bb8da93", "eeb7b442-a989-48ed-ac46-68dde7ae5545", "303031e0-4fd2-4d6f-9f78-7ffc1c3bf53d", "d2f9f371-dc09-4092-a3b4-36a8ab741b2b", "76f680e6-d3b9-4e9e-8532-270c5ba1beaa", "42db4fed-5492-4779-9d30-0df8708d8efc", "3b7d88f7-70ca-4326-8a7c-c95de82df94a", "e206f459-fa54-41f8-91f7-e424e4b3509c", "06a78346-c988-42a9-b994-55669201c229", "8b412cd2-ec4a-4e02-98a8-f095afa6bcea", "d4284f0c-3033-4810-b288-297d7de602a7", "2dcbf92c-f67f-4e16-b08a-18f8f9292e5a", "3f4d693f-758b-417d-a49c-937124125b37", "6a0b37cc-1a51-4b71-ab7f-2d1514dca2c0", "53cdb73d-5512-4109-bbb5-fdfca9af9688", "5d99e009-d3b6-4ce0-b3e4-afd4ac6a8f78", "1648a124-1572-4174-9d2a-1a7f0dd65aef", "cdf57a97-d1e8-4f86-a702-0ea0d649037a", "8ca76ac9-c3c7-4972-b5d7-06dcd1651564", "d2a915c4-dbd0-45c1-bbe2-05c705b755b8", "b78d8d83-eb6e-488a-b049-bd21019d0972", "fe82d702-31eb-43b0-adef-e06eb46bef19", "8ea717dc-bda1-4fa6-84fa-8c9b7f4c3e13", "5085a3f8-7dbf-4420-a151-378e8930e331", "c071ca28-c26e-4601-9e0d-670199c41a29", "72bdb41d-ca7e-4787-bacc-da750d9652d3", "62705c94-679a-40ce-ab01-fdf9d19e0727"] } }

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      console.log(fakeRes)

      var jsonRes = fakeRes;

      //self.setState({contamResult: jsonRes});
      self.handleNext();
      console.log(jsonRes)
    });









  }

  render() {
    /*
        <input
          onChange={(e) => this.handleSeqPath(e)}
          style={{display: "none"}}
          type="file"
        />
    */


    var tutorialSteps: any = this.getStepperSteps();

    const { activeStep } = this.state;
    const maxSteps = tutorialSteps.length;

    console.log("Render")

    return (
      <div>
        <Card style={{ marginBottom: "25px" }}>
          <AppBar position="static" style={{ backgroundColor: 'black' }}>
            <Toolbar>
              <Typography variant="title" color="default">
                <img src={tutorialSteps[activeStep].topimgPath} width="190" height="48" />
              </Typography>
            </Toolbar>
          </AppBar>
        </Card>
        <Card style={{ marginBottom: "25px" }}>
          <CardContent>
            <div style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "50%" }}>
              {tutorialSteps[activeStep].imgPath ? <img src={tutorialSteps[activeStep].imgPath} width="400" height="100" /> : <div></div>}

              <p>{tutorialSteps[activeStep].header}</p>
            </div>
            <MobileStepper
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              nextButton={activeStep == maxSteps - 2 ?
                (<Button
                  variant="contained"
                  color="primary"
                  onClick={tutorialSteps[activeStep].buttonAction}
                  disabled={activeStep === maxSteps - 1} >
                  Start
              <Icon >search</Icon>
                </Button>
                ) : (<Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
                  Next
              <KeyboardArrowRight />
                </Button>)
              }

              backButton={
                <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
                  Reset
              <Icon>youtube_searched_for</Icon>
                </Button>
              }
            />
          </CardContent>
        </Card>
        <Card style={{ marginBottom: "25px" }}>
          <CardContent>
            <Paper square elevation={0}>
              <div>{tutorialSteps[activeStep].label}</div>
            </Paper>
          </CardContent>
        </Card>
        {tutorialSteps[activeStep].content}

      </div>
    );
  }
}

export default TextMobileStepper;