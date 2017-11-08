'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var firestoreReduxSubscribe = function firestoreReduxSubscribe(firebaseRef, onData) {
  var unsubscribeFn = void 0;
  if (firebaseRef instanceof _firebase2.default.firestore.CollectionReference) {
    unsubscribeFn = firebaseRef.onSnapshot(handleCollectionReferenceSnapshot.bind(undefined, onData), handleSnapshotError);
  } else if (firebaseRef instanceof _firebase2.default.firestore.DocumentReference) {
    unsubscribeFn = firebaseRef.onSnapshot(handleDocumentReferenceSnapshot.bind(undefined, onData), handleSnapshotError);
  } else if (firebaseRef instanceof _firebase2.default.firestore.Query) {
    unsubscribeFn = firebaseRef.onSnapshot(handleCollectionReferenceSnapshot.bind(undefined, onData), handleSnapshotError);
  } else {
    throw new Error('Invalid Firebase Reference: got ' + (typeof firebaseRef === 'undefined' ? 'undefined' : _typeof(firebaseRef)) + '. Must be either a CollectionReference, DocumentReference or Query.');
  }
  return unsubscribeFn;
};

var handleCollectionReferenceSnapshot = function handleCollectionReferenceSnapshot(onData, collectionSnapshot) {
  var data = collectionSnapshot.docs.map(function (doc) {
    return _extends({}, doc.data(), {
      id: doc.id
    });
  });
  onData(data);
};

var handleDocumentReferenceSnapshot = function handleDocumentReferenceSnapshot(onData, documentSnapshot) {
  var data = documentSnapshot.data();
  var docData = _extends({}, data, {
    id: documentSnapshot.id
  });
  onData(docData);
};

var handleSnapshotError = function handleSnapshotError(error) {
  console.error('Firestore Error:');
  console.error(error);
};

var withFirestore = function withFirestore(refs) {
  return function (WrappedComponent) {
    return function (_Component) {
      _inherits(_class, _Component);

      function _class(props) {
        _classCallCheck(this, _class);

        var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

        _this.state = {
          loading: true,
          listeners: null,
          refs: typeof refs === 'function' ? refs(_this.props) : refs,
          data: {}
        };
        return _this;
      }

      _createClass(_class, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _this2 = this;

          if (Array.isArray(this.state.refs)) {
            var listeners = this.state.refs.map(function (refData) {
              return firestoreReduxSubscribe(refData.ref, _this2.handleFirestoreResult.bind(_this2, refData.name));
            });
            this.setState({ listeners: listeners });
          } else {
            throw new Error('withFirestore Error: Refs needs to be an array.');
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.state.listeners.forEach(function (listener) {
            return listener();
          });
        }
      }, {
        key: 'handleFirestoreResult',
        value: function handleFirestoreResult(refName, firestoreData) {
          var _this3 = this;

          var refNames = this.state.refs.map(function (refData) {
            return refData.name;
          });

          var loading = !refNames.every(function (currRefName) {
            return currRefName === refName || currRefName in _this3.state.data;
          });

          this.setState({
            data: _extends({}, this.state.data, _defineProperty({}, refName, firestoreData)),
            loading: loading
          });
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, _extends({}, this.props, this.state));
        }
      }]);

      return _class;
    }(_react.Component);
  };
};

exports.default = withFirestore;