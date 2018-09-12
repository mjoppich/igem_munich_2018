import * as React from 'react';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Card } from '@material-ui/core';

const tutorialSteps = [
  {
    label: 'How to be happy :)',
    header: "Welcome to the contamination tool"
    //imgPath: '/static/images/steppers/1-happy.jpg',
  },
  {
    label: '1. Work with something that you like, like…',
    header: "WORK",
    imgPath: '/static/images/steppers/2-work.jpg',
    content: <Button variant="contained" color="default">
    Upload
    <CloudUploadIcon />
  </Button>
  },
  {
    label: '2. Keep your friends close to you and hangout with them',
    header: "FRIENDS",
    imgPath: '/static/images/steppers/3-friends.jpg',
  },
  {
    label: '3. Travel everytime that you have a chance',
    header: "TRAVEL",
    imgPath: '/static/images/steppers/4-travel.jpg',
  },
  {
    label: '4. And contribute to Material-UI :D',
    header: "MUI",
    imgPath: '/static/images/steppers/5-mui.png',
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

        <p>{tutorialSteps[activeStep].header}</p>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
        </Card>
        <Card>
        <Paper square elevation={0}>
          <Typography>{tutorialSteps[activeStep].label}</Typography>
        </Paper>
        {tutorialSteps[activeStep].content}
        </Card>
      </div>
    );
  }
}


export default TextMobileStepper;