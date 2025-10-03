import React from 'react';
import renderer from 'react-test-renderer';
import { RuleOfThirds } from '../overlays/RuleOfThirds';
import { Crosshair } from '../overlays/Crosshair';

describe('overlay snapshots', () => {
  const baseProps = {
    width: 300,
    height: 400,
    color: '#ffffff',
    opacity: 0.8,
    thickness: 2,
    safeInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  };

  it('renders rule of thirds overlay', () => {
    const tree = renderer.create(<RuleOfThirds {...baseProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders crosshair overlay', () => {
    const tree = renderer.create(<Crosshair {...baseProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
