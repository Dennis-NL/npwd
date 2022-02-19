/**
 * Credit to MUI team @ https://mui.com
 */
import * as React from 'react';
import clsx from 'clsx';
import { TransitionHandlerProps, TransitionProps } from 'notistack';
import useForkRef from '@common/hooks/useForkRef';
import getTransitionProps from '../helpers/getTransitionProps';
import getAutoHeightDuration from '../helpers/getAutoHeightDuration';
import TransitionComponent from './Transition';
import { ComponentClasses, makeStyles } from './utils';
import createTransition from '../helpers/createTransition';
import { TransitionStatus } from './types';

const classes = makeStyles({
  root: {
    height: 0,
  },
  entered: {
    height: 'auto',
  },
});

const collapsedSize = '0px';

const Collapse = React.forwardRef<unknown, TransitionProps>((props, ref) => {
  const {
    children,
    style,
    timeout = props.timeout,
    in: inProp,
    onEnter,
    onEntered,
    onExit,
    onExited,
    direction, // Take this out since this is a Slide-only prop
    ...other
  } = props;

  console.log(props);

  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = React.useRef(null);
  const autoTransitionDuration = React.useRef<number>();

  React.useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(ref, nodeRef);

  const getWrapperSize = () => (wrapperRef.current ? wrapperRef.current.clientHeight : 0);

  const handleEnter: TransitionHandlerProps['onEnter'] = (node, isAppearing, snackId) => {
    node.style.height = collapsedSize;
    if (onEnter) {
      onEnter(node, isAppearing, snackId);
    }
  };

  const handleEntering = (node: HTMLElement) => {
    const wrapperSize = getWrapperSize();

    const { duration: transitionDuration, easing } = getTransitionProps({
      style,
      timeout,
      mode: 'enter',
    });

    if (timeout === 'auto') {
      const duration2 = getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style.height = `${wrapperSize}px`;
    node.style.transitionTimingFunction = easing || '';
  };

  const handleEntered: TransitionHandlerProps['onEntered'] = (node, isAppearing, snackId) => {
    node.style.height = 'auto';
    if (onEntered) {
      onEntered(node, isAppearing, snackId);
    }
  };

  const handleExit: TransitionHandlerProps['onExit'] = (node, snackId) => {
    node.style.height = `${getWrapperSize()}px`;
    if (onExit) {
      onExit(node, snackId);
    }
  };

  const handleExiting = (node: HTMLElement) => {
    const wrapperSize = getWrapperSize();
    const { duration: transitionDuration, easing } = getTransitionProps({
      style,
      timeout,
      mode: 'exit',
    });

    if (timeout === 'auto') {
      const duration2 = getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration =
        typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
    }

    node.style.height = collapsedSize;
    node.style.transitionTimingFunction = easing || '';
  };

  const handleAddEndListener = (next: any) => {
    if (timeout === 'auto') {
      timer.current = setTimeout(next, autoTransitionDuration.current || 0);
    }
  };

  return (
    <TransitionComponent
      in={inProp}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={onExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      nodeRef={nodeRef}
      timeout={1000}
      {...other}
    >
      {(state: TransitionStatus, childProps: Record<string, any>) => (
        <div
          ref={handleRef}
          className={clsx(classes.root, { [classes.entered]: state === 'entered' })}
          style={{
            pointerEvents: 'all',
            overflow: 'hidden',
            minHeight: collapsedSize,
            transition: createTransition('height'),
            ...(state === 'entered' && {
              overflow: 'visible',
            }),
            ...(state === 'exited' &&
              !inProp && {
                visibility: 'hidden',
              }),
            ...style,
          }}
          {...childProps}
        >
          <div
            ref={wrapperRef}
            className={ComponentClasses.CollapseWrapper}
            // Hack to get children with a negative margin to not falsify the height computation.
            style={{ display: 'flex' }}
          >
            <div style={{ width: '100%' }}>{children}</div>
          </div>
        </div>
      )}
    </TransitionComponent>
  );
});

export default Collapse;
