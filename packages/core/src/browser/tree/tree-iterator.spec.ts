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
import { TopDownTreeIterator } from './tree-iterator';
import { TreeNode, CompositeTreeNode } from './tree';

describe('TopDownTreeIterator', () => {

    it('should terminate when encountering a cycle in sibling links', () => {
        const root: CompositeTreeNode = {
            id: 'root',
            parent: undefined,
            visible: true,
            children: [],
            expanded: true
        };
        const child: TreeNode = {
            id: 'child',
            parent: root,
            visible: true
        };
        root.children = [child];
        // Introduce a cycle: the child is its own nextSibling.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (child as any).nextSibling = child;

        const visited = Array.from(new TopDownTreeIterator(root, { pruneCollapsed: true, pruneSiblings: true })).map(node => node.id);

        expect(visited).to.deep.equal(['root', 'child']);
    });

});
