// @format
import React from "react";
import EnvelopeGraph from "react-envelope-graph";
import { Flex } from "./UIComponents";
import Knob from "react-simple-knob";
import { TimeKnob, DecibelKnob } from "./Knobs";
import WaveGraph from "./WaveGraph";
import {
  theme,
  BorderList,
  Panel,
  List,
  Element,
  Row,
  Toggle
} from "./UIComponents";

let styles = {
  line: {
    fill: "none",
    stroke: theme.secondary,
    strokeWidth: 2
  },
  dndBox: {
    fill: "none",
    stroke: theme.white,
    strokeWidth: 0.1,
    height: 1,
    width: 1
  },
  dndBoxActive: {
    fill: theme.white
  },
  corners: {
    strokeWidth: 0.1,
    length: 1.5,
    stroke: theme.white
  }
};

export default class EnvelopePanel extends React.Component {
  constructor(props) {
    super(props);

    const { envelope } = props.synth;

    this.state = {
      // TODO: When finalizing the interface, make this state variable adjustable
      oscSelected: 0,
      oscillators: [
        {
          enabled: true,
          label: "a",
          color: "#FAFAFA",
          bg: theme.secondary,
          envelope,
          waveForm: 0
        },
        {
          enabled: true,
          label: "b",
          color: "#FAFAFA",
          bg: "#2274A5",
          envelope,
          waveForm: 0
        },
        {
          enabled: true,
          label: "c",
          color: "#FAFAFA",
          bg: "#F2D0A4",
          envelope,
          waveForm: 0
        },
        {
          enabled: true,
          label: "d",
          color: "#FAFAFA",
          bg: "#83B692",
          envelope,
          waveForm: 0
        }
      ]
    };

    this.handleEnvelopeChange = this.handleEnvelopeChange.bind(this);
    this.handleWaveFormChange = this.handleWaveFormChange.bind(this);
    this.handleEnable = this.handleEnable.bind(this);
  }

  handleEnvelopeChange(envelope) {
    const {
      synth: { onEnvelopeChange }
    } = this.props;
    let { oscillators, oscSelected } = this.state;

    oscillators[oscSelected].envelope = envelope;
    onEnvelopeChange(oscSelected)(envelope);
    this.setState({ oscillators });
  }

  handleWaveFormChange(waveForm) {
    const {
      synth: { onWaveFormChange }
    } = this.props;
    let { oscillators, oscSelected } = this.state;
    oscillators[oscSelected].waveForm = waveForm;
    onWaveFormChange(oscSelected, waveForm);
    this.setState({ oscillators });
  }

  handleEnable(i) {
    return () => {
      const {
        synth: { onEnableOscillator }
      } = this.props;
      const { oscillators } = this.state;
      oscillators[i].enabled = !oscillators[i].enabled;
      onEnableOscillator(i, oscillators[i].enabled);
      this.setState({ oscillators });
    };
  }

  render() {
    const {
      synth: { onLevelChange, calcEnvelopeMapping }
    } = this.props;
    const { oscSelected, oscillators } = this.state;
    const selected = oscillators[oscSelected];
    const mappedEnvelope = calcEnvelopeMapping(selected.envelope);
    const color = selected.enabled ? selected.bg : theme.fg;

    styles.line.stroke = color;

    return (
      <Panel>
        <List width="15%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          {oscillators.map((elem, i) => (
            <Element
              onMouseDown={() => this.setState({ oscSelected: i })}
              justifySpaceAround
              itemsCenter
              key={i}
              style={{
                border: i === oscSelected ? "1px solid #555" : "1px solid black"
              }}
            >
              <Knob
                onChange={v => onLevelChange(i)(Math.abs(v + 100) / 100)}
                name="Level"
                unit="dB"
                defaultPercentage={0.5}
                bg={elem.enabled ? elem.bg : theme.fg}
                fg={elem.color}
                mouseSpeed={5}
                transform={p => parseInt(p * 50, 10) - 50}
                style={{
                  fontSize: 35,
                  height: "1.1em",
                  color: elem.color
                }}
              />
              <Toggle
                onClick={this.handleEnable(i)}
                bg={elem.enabled ? elem.bg : theme.fg}
                color={elem.color}
              >
                {elem.label.toUpperCase()}
              </Toggle>
            </Element>
          ))}
        </List>
        <EnvelopeGraph
          style={{
            minWidth: "68%",
            padding: ".5%",
            backgroundColor: theme.bg,
            borderRadius: theme.radius.light,
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
            borderBottom: "3px solid black"
          }}
          styles={styles}
          defaultXa={selected.envelope.xa}
          defaultXd={selected.envelope.xd}
          defaultYs={selected.envelope.ys}
          defaultXr={selected.envelope.xr}
          ratio={{
            xa: 0.25,
            xd: 0.25,
            xr: 0.25
          }}
          onChange={this.handleEnvelopeChange}
        />
        <BorderList width="20%" directionColumn>
          {/*https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2019/01/25-Bright-Neon-Color-Palettes11.jpg*/}
          <Row style={{ "user-select": "none" }} justifySpaceAround itemsCenter>
            <TimeKnob color={color} name="Attack" value={mappedEnvelope.xa} />
            <TimeKnob color={color} name="Decay" value={mappedEnvelope.xd} />
            <DecibelKnob
              color={color}
              name="Sustain"
              value={mappedEnvelope.ys}
            />
            <TimeKnob color={color} name="Release" value={mappedEnvelope.xr} />
          </Row>
          <Row justifySpaceAround itemsFlexStart>
            <WaveGraph
              value={selected.waveForm}
              onChange={this.handleWaveFormChange}
              color={color}
            />
          </Row>
        </BorderList>
      </Panel>
    );
  }
}
