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
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
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
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: {
            Accept: "application/json",
          },
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuid(), text: newJoke, votes: 0 });
        } else {
          console.log("Duplicate", newJoke);
        }
      }
      this.setState(
        (st) => ({
          jokes: [...st.jokes, ...jokes],
          loading: false,
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
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
      let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

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
              Fetch Jokes
            </button>
          </div>
          <div className="JokeList-jokes">
            {jokes.map((j) => (
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
