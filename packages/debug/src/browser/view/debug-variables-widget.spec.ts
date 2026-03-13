// *****************************************************************************
// Copyright (C) 2026 and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { expect } from 'chai';
import { DebugVariablesWidget, DebugVariablesWidgetSessionState } from './debug-variables-widget';
import { DebugStackFrame } from '../model/debug-stack-frame';
import { DebugSession } from '../debug-session';

type FrameStub = Pick<DebugStackFrame, 'id' | 'session'>;

describe('DebugVariablesWidget - handleDidFocusStackFrame', () => {

    function createFrame(id: string, sessionId = 'session-id'): FrameStub {
        return {
            id,
            session: { id: sessionId } as DebugSession
        };
    }

    function createWidget() {
        let storeCount = 0;
        const restoredStates: object[] = [];

        const widget: DebugVariablesWidget & {
            superStoreState: () => object;
            superRestoreState: (state: object) => void;
            stateRestorations: object[];
        } = {
            statePerSession: new Map<string, DebugVariablesWidgetSessionState>(),
            stackFrame: undefined,
            superStoreState: () => ({ token: ++storeCount }),
            superRestoreState: (state: object) => restoredStates.push(state),
            newSessionState: DebugVariablesWidget.prototype.newSessionState
        } as unknown as DebugVariablesWidget & {
            superStoreState: () => object;
            superRestoreState: (state: object) => void;
            stateRestorations: object[];
        };

        widget.getOrCreateSessionState = DebugVariablesWidget.prototype.getOrCreateSessionState.bind(widget);
        widget.handleDidFocusStackFrame = DebugVariablesWidget.prototype.handleDidFocusStackFrame.bind(widget);
        widget.stateRestorations = restoredStates;

        return { widget, restoredStates };
    }

    it('does not restore state when focusing a new stack frame object with the same id', () => {
        const { widget, restoredStates } = createWidget();
        const frame = createFrame('frame-1');
        const newFrameWithSameId = createFrame('frame-1');

        widget.stackFrame = frame as DebugStackFrame;
        widget.handleDidFocusStackFrame(newFrameWithSameId as DebugStackFrame);

        const sessionState = widget.statePerSession.get(frame.session.id)!;
        expect(sessionState.getStateForStackFrame(frame as DebugStackFrame)).to.deep.equal({ token: 1 });
        expect(restoredStates).to.be.empty;
    });

    it('restores state when focusing a stack frame with a different id', () => {
        const { widget, restoredStates } = createWidget();
        const frame = createFrame('frame-1');
        const otherFrame = createFrame('frame-2');
        const sessionState = widget.getOrCreateSessionState(otherFrame.session);
        const storedState = { saved: true };
        sessionState.setStateForStackFrame(otherFrame as DebugStackFrame, storedState);

        widget.stackFrame = frame as DebugStackFrame;
        widget.handleDidFocusStackFrame(otherFrame as DebugStackFrame);

        expect(restoredStates).to.deep.equal([storedState]);
    });
});
