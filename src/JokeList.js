import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
import uuid from "uuid/dist/v4";
class JokeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    this.handleVotes = this.handleVotes.bind(this);
  }
  static defaultProps = {
    numJokesToGet: 10,
  };
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }
  handleVotes(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  async getJokes() {
    let jokes = [];
    while (jokes.length < this.props.numJokesToGet) {
      let res = await axios.get("https://icanhazdadjoke.com/", {
        headers: {
          Accept: "application/json",
        },
      });
      jokes.push({ id: uuid(), text: res.data.joke, votes: 0 });
    }
    this.setState(
      (st) => ({
        jokes: [...st.jokes, ...jokes],
        loading: false,
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick = () => {
    this.setState({ loading: true }, this.getJokes);
  };
  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin"></i>
          <h1 className="JokeList-title">Loading.....</h1>
        </div>
      );
    } else {
      return (
        <div className="JokeList">
          <div className="JokeList-sidebar">
            <h1 className="JokeList-title">
              <span>Dad</span> Jokes!
            </h1>
            <img
              src="https://image.flaticon.com/icons/svg/743/743247.svg"
              alt="laughing emogi"
            ></img>
            <button onClick={this.handleClick} className="JokeList-getmore">
              New Jokes
            </button>
          </div>
          <div className="JokeList-jokes">
            {this.state.jokes.map((j) => (
              <Joke
                key={j.id}
                votes={j.votes}
                text={j.text}
                upvotes={() => this.handleVotes(j.id, 1)}
                downvotes={() => this.handleVotes(j.id, -1)}
              ></Joke>
            ))}
          </div>
        </div>
      );
    }
  }
}

export default JokeList;
