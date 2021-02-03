import React, {Component} from 'react';
import './JokeList.css';
import Joke from './Joke';

class JokeList extends Component {
    static defaultProps = {
        numJokes: 10
    }

    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(localStorage.getItem("jokes") || "[]"),
            loading: false
        };
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();    
    }

    async getJokes() {
        let jokes=[];
        while(jokes.length < this.props.numJokes) {
            let res = await fetch('https://icanhazdadjoke.com/', {
                headers: {Accept: 'Application/JSON'}
            }).then(res => res.json());
            let newJoke = res.joke;
            if(!this.seenJokes.has(newJoke)) {
                jokes.push({text: res.joke, votes: 0, id: res.id});
                this.seenJokes.add(newJoke);
            } else {
                console.log('Duplicate');
            }
            
        }
        this.setState(st => ({
            jokes: [...st.jokes, ...jokes],
            loading: false
        }), () => {
            localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
        });
    }

    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => 
                j.id === id ? {...j, votes: j.votes + delta} : j
            )
        }), () => {
            localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
        });
    }

    handleClick() {
        this.setState({loading: true}, this.getJokes);
    }

    render() {
        if(this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"/>
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        return (
            
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt=""/>
                    <button className="JokeList-getmore" onClick={this.handleClick}>
                        Get Jokes
                    </button>
                </div>
                <div className="JokeList-jokes">
                    {jokes.map(j => (
                        <Joke 
                            text={j.text} 
                            votes={j.votes} 
                            key={j.id}
                            upVote={() => this.handleVote(j.id, 1)}
                            downVote={() => this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default JokeList;