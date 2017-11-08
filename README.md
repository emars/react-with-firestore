# React With Firestore

Provides a HOC to listen to Firestore (Queries, Documents or Collections) and pass data to React Components.

## About

This module accepts a `refs` argument can be either an array or a function returning an array.

This array contains the Firestore Queries, Documents or Collection references that should be passed to the Component as well as the names to access them.

The HOC will pass a `data` and `loading` prop to the wrapped component.

## Installation

```
yarn add react-with-firestore
```

## Example

```js
import React, { Component } from 'react'
import withFirestore from 'react-with-firestore'

class Todos extends Component {
    render () {
        if (this.props.loading) {
            return (
                <p>loading...</p>
            )
        }

        // data contains a key called 'todos' as specified by the refs
        return this.props.data.todos.map((todo) => {
            // render the item...
        })
    }
}

const todosCollection = firestore.collection('todos')

const refs = (props) => ([
    {
        name: 'todos',
        ref: todosCollection
    }
])
}

export default withFirestore(refs)(Todos)
```

## License

MIT