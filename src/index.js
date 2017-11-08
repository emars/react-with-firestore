import React, { Component } from 'react'
import firebase from 'firebase'

const firestoreReduxSubscribe = (firebaseRef, onData) => {
  let unsubscribeFn
  if (firebaseRef instanceof firebase.firestore.CollectionReference) {
    unsubscribeFn = firebaseRef.onSnapshot(
      handleCollectionReferenceSnapshot.bind(this, onData),
      handleSnapshotError
    )
  } else if (firebaseRef instanceof firebase.firestore.DocumentReference) {
    unsubscribeFn = firebaseRef.onSnapshot(
      handleDocumentReferenceSnapshot.bind(this, onData),
      handleSnapshotError
    )
  } else if (firebaseRef instanceof firebase.firestore.Query) {
    unsubscribeFn = firebaseRef.onSnapshot(
      handleCollectionReferenceSnapshot.bind(this, onData),
      handleSnapshotError
    )
  } else {
    throw new Error(
      `Invalid Firebase Reference: got ${typeof firebaseRef}. Must be either a CollectionReference, DocumentReference or Query.`
    )
  }
  return unsubscribeFn
}

const handleCollectionReferenceSnapshot = (onData, collectionSnapshot) => {
  const data = collectionSnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }))
  onData(data)
}

const handleDocumentReferenceSnapshot = (onData, documentSnapshot) => {
  const data = documentSnapshot.data()
  const docData = {
    ...data,
    id: documentSnapshot.id
  }
  onData(docData)
}

const handleSnapshotError = error => {
  console.error('Firestore Error:')
  console.error(error)
}

const withFirestore = refs => WrappedComponent =>
  class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        loading: true,
        listeners: null,
        refs: typeof refs === 'function' ? refs(this.props) : refs,
        data: {}
      }
    }
    componentWillMount() {
      if (Array.isArray(this.state.refs)) {
        const listeners = this.state.refs.map(refData =>
          firestoreReduxSubscribe(
            refData.ref,
            this.handleFirestoreResult.bind(this, refData.name)
          )
        )
        this.setState({ listeners })
      } else {
        throw new Error('withFirestore Error: Refs needs to be an array.')
      }
    }
    componentWillUnmount() {
      this.state.listeners.forEach(listener => listener())
    }
    handleFirestoreResult(refName, firestoreData) {
      const refNames = this.state.refs.map(refData => refData.name)

      const loading = !refNames.every(currRefName => {
        return currRefName === refName || currRefName in this.state.data
      })

      this.setState({
        data: {
          ...this.state.data,
          ...{
            [refName]: firestoreData
          }
        },
        loading
      })
    }
    render() {
      return <WrappedComponent {...this.props} {...this.state} />
    }
  }

export default withFirestore
