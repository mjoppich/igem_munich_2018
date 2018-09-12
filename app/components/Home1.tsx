import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';
import { spawn } from 'child_process';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';




export default class Home extends React.Component<{initialText: string}, {ret: any}> {

  state = {
    ret : new Array<string>()
  }

  extProg()
  {
    var self = this;
    let res = spawn("echo", ['Hello World'])

    res.stdout.on('data', function(data) {
        console.log('stdout: ' + data);

        var elem : string = "" + data;
        var newret = self.state.ret;
        newret.push(elem);

        self.setState({ret: newret})
      });

  }


  render() {

    var self=this;

    var outStr = [];

    if (this.state.ret.length == 0)
    {
      var newCard = <Card key={outStr.length}>
            <CardContent>
              <Typography component="pre" style={{fontFamily: "Helvetica"}}>
              {
                this.props.initialText
              }
              </Typography>
            </CardContent>
          </Card>;

      outStr.push(newCard);
    } else {

      for (var i = 0; i < this.state.ret.length; ++i)
      {


            var newCard = <Card key={outStr.length}>
            <CardContent>
              <Typography component="pre" style={{fontFamily: "Helvetica"}}>
              {
                this.state.ret[i]
              }
              </Typography>
            </CardContent>
          </Card>;

      outStr.push(newCard);

      }


    }
    var activeStep = 0;
    var steps = ["step1", "step2", "step3"];

    return (
      <div>

<Card>
      <CardActionArea>
        <CardMedia
          component="img"
          image="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            minION Lizard
          </Typography>
          <Typography component="p">
            Sequencing genomes flawlessly using Oxford Nanopore minION technology is like taming a lizard: hard and impossible.
          </Typography>
          <Typography component="p">
            Even if you think you did the wetlab part right, your drylab master will tell you, something is screwed up.
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
          <Button component={({ innerRef, ...props }) => <Link {...props} to="/counter" />}>
              Bring me to my truth.
          </Button>

          <Button onClick={() => { self.extProg() }}>
              Let's have fun.
          </Button>

      </CardActions>
    

        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const props: any = {};
            const labelProps: any = {};
            if (this.isStepOptional(index)) {
              labelProps.optional = <Typography variant="caption">Optional</Typography>;
            }
            props.completed = false;
            return (
              <Step key={index} {...props}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

    </Card>


      {outStr}

      </div>

    );
  }

  isStepOptional(step: any) {
    return step === 1;
  };
}
