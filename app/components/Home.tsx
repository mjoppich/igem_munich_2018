import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Card } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import SaveIcon from '@material-ui/icons/Save';

const tutorialSteps = [
  {
    label: 'Even if you think you did the wetlab part right, your drylab master will tell you, something is screwed up.',
    header: "Welcome to the contamination tool SequInto",
    imgPath: '../sequinfo_logo.jpeg',
  },
  {
    label: '1. Work with something that you like, like…',
    header: "WORK",
    
    content: <Button variant="contained" color="default">
    Upload
    <CloudUploadIcon />
  </Button>
  },
  {
    label: '2. Keep your friends close to you and hangout with them',
    header: "FRIENDS",
    
    content: <div>
      <Card style={{marginBottom: "50px"}}>
        <Button variant="contained" color="default">
        Upload
        <CloudUploadIcon />
        </Button>
      </Card>
      <Card style={{marginBottom: "50px"}}>
      <p><i>E.coli</i></p>
      <IconButton aria-label="Delete" disabled color="primary">
        <DeleteIcon />
      </IconButton>
    </Card>
    <Card style={{marginBottom: "50px"}}>
      <p>Human</p>
      <IconButton aria-label="Delete" disabled color="primary">
        <DeleteIcon />
      </IconButton>
    </Card>
    </div>
  },
  {
    label: '3. Travel everytime that you have a chance',
    header: "TRAVEL"
  },
  {
    label: '4. And contribute to Material-UI :D',
    header: "MUI",
    content: <div>
      <Button variant="contained" size="small" >
        <SaveIcon />
        Save
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
      activeStep: prevState.activeStep - 1,
    }));
  };

  render() {
    const { activeStep } = this.state;
    const maxSteps = tutorialSteps.length;

    return (
      <div>
        <Card style={{marginBottom: "50px"}}>
        <img
          src={tutorialSteps[activeStep].imgPath} width="600" height="300"
        />
        <p>{tutorialSteps[activeStep].header}</p>
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
              <KeyboardArrowLeft />
              Reset
              <Icon>youtube_searched_for</Icon>
            </Button>
          }
        />
        </Card>
        <Card style={{marginBottom: "50px"}}>
        <Paper square elevation={0}>
          <Typography>{tutorialSteps[activeStep].label}</Typography>
        </Paper>
        </Card>
        {tutorialSteps[activeStep].content}
        
      </div>
    );
  }
}

export default TextMobileStepper;