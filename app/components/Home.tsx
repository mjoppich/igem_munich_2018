import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Card } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CardContent from '@material-ui/core/CardContent';

const tutorialSteps = [
  {
    label: 'Even if you think you did the wetlab part right, your drylab master will tell you, something is screwed up. Nanopore sequencing of bacteriophages was one of the important topics that we worked with. The analysis of the MinION sequencing data was orientated to build one consensus sequencing out of all sequences (reads) gained by sequencing of each DNA sample. This consensus sequence can also be used to determine the origin and genetic makeup of the bacteriophage. Sequencing results of five different phages (T4, T7, NES, 3S, FFP) shown high contamination by E.coli that was not seen on the gel in the lab. In order to build quality control of each sequencing and analyse rational only the data without forein DNA we provide a tool to check for contamination that does not require any data preprocessing and is in principle suitable for every sequencing method that will give standard .fastq output format. This tool is also helpful by building the consensus sequence, because there is an option to extract only sequences (reads) that were not identified as part of contamination DNA sample.',
    header: "Welcome to the contamination tool SequInto",
    imgPath: '../sequinfo_logo.jpeg',
  },
  {
    header: 'Sequencing data',
    label: "Reads in fastq",
    
    content: <Button variant="contained" color="default">
    Upload
    <Icon>attach_file</Icon>
  </Button>
  },
  {
    header: 'Contaminations',
    label: "fasta",
    
    content: <div>
      <Card style={{marginBottom: "50px"}}>
        <Button variant="contained" color="default">
        Upload
        <Icon>attach_file</Icon>
        </Button>
      </Card>
      <Card style={{marginBottom: "50px"}}>
      <CardContent>
        <div style={{display: "inline-flex", verticalAlign: "middle", alignItems: "center"}}>
          <span>Escherichia coli</span>
          <IconButton aria-label="Delete" color="primary">
          <DeleteIcon />
          </IconButton>
        </div>
      </CardContent>

    </Card>
    <Card style={{marginBottom: "50px"}}>
    <CardContent>
    <div style={{display: "inline-flex", verticalAlign: "middle", alignItems: "center"}}>
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
    label: "User input summary",
    content: <LinearProgress />
  },
  {
    header: 'Results',
    label: "Statistics",
    content: <div>
      <Button variant="contained" size="small" >
      Save
      <Icon>save_alt</Icon>
      </Button>
    </div>
  },
];


class TextMobileStepper extends React.Component<{},{activeStep:any}> {
  state = {
    activeStep: 0,
  };

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: 0,
    }));
  };

  render() {
    const { activeStep } = this.state;
    const maxSteps = tutorialSteps.length;

    return (
      <div>
        <Card style={{marginBottom: "25px"}}>
        <CardContent>
        <div style={{display: "block", marginLeft: "auto", marginRight: "auto", width: "50%"}}>
        { tutorialSteps[activeStep].imgPath ? <img src={tutorialSteps[activeStep].imgPath} width="600" height="300"/> : <div></div>} 
        
        <p>{tutorialSteps[activeStep].header}</p>
        </div>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={ activeStep == maxSteps-2 ?
            (<Button variant="contained" color="primary" onClick={this.handleNext} disabled={activeStep === maxSteps - 1} >
              Start 
              <Icon >search</Icon>
            </Button>
            ):(<Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
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
        <Card style={{marginBottom: "25px"}}>
        <CardContent>
        <Paper square elevation={0}>
          <Typography>{tutorialSteps[activeStep].label}</Typography>
        </Paper>
        </CardContent>
        </Card>
        {tutorialSteps[activeStep].content}
        
      </div>
    );
  }
}

export default TextMobileStepper;