
const resolvedUnit = {
    'F': 'imperial',
    'C': 'metric',
    'K': ''
};

class UnitSelector extends React.Component {
	constructor(props) {
		super(props);
	    this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
	    this.props.onUnitChange(e.target.value);
    }

	render() {
		return (
			<select className="unit-selector" value={this.props.unit} onChange={this.handleChange}>
				<option value="C">Celsius</option>
				<option value="F">Fahrenheit</option>
				<option value="K">Kelvin</option>
			</select>
		);
	}
}

class CitySelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetchedCities: ['Gurugram', 'Delhi']
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onCityChange(e.target.value);
    }

    render() {
        let fetchedCities = this.state.fetchedCities;
        let cityList = fetchedCities.map((cityName) => 
                                (<option value={cityName} key={cityName}>{cityName}</option>)
                        );

        return (
            <select className="city-selector" value={this.props.cityName} onChange={this.handleChange}>
                <option value="Select">Select</option>
                {cityList}
            </select>
        );
    }
}

class TemperatureIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetchedTemp: '',
            currentStatus: 'Please select city.'
        };
        this.showFetchedFailError = this.showFetchedFailError.bind(this);
    }

    showFetchedFailError(response) {
        console.log('Network request for weather failed with response '
                    + response.status + ': ' + response.statusText);
        this.setState({
           currentStatus: "Sorry, request failed."
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState((prevState, props) => {
            return {
                currentStatus: (nextProps.cityName === 'Select')?'Please select city':'Loading...'
            }
        });

        let url = `http://api.openweathermap.org/data/2.5/find?q=${nextProps.cityName},in&units=${nextProps.unit}&APPID=d3d742a3a686e03cbcb52eeff95506ee`;

        fetch(url).then((response) => {
            if(response.ok) {
                response.json().then((data) => {
                    //alert(data);
                    this.setState({
                        fetchedTemp: data.list[0].main.temp.toString(),
                        currentStatus: ''
                    });
                });
            }
            else {
                this.showFetchedFailError(response);
            }
        }).catch((response)=>{
            this.showFetchedFailError(response);
        })
    }

    render() {
        let tempElem = (this.state.currentStatus)?
                        <span>{this.state.currentStatus}</span>:
                        <span>{this.state.fetchedTemp}</span>
        return (
            <div>
                {tempElem}
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCity: 'Select',
            currentUnit: 'C'
        };
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleUnitChange = this.handleUnitChange.bind(this);
    }

    handleCityChange(cityName) {
        this.setState({
           currentCity: cityName
        });
    }

    handleUnitChange(unit) {
        this.setState({
           currentUnit: unit
        });
    }

    render() {
        return (
            <div className='weather-app'>
                <TemperatureIndicator
                    cityName={this.state.currentCity}
                    unit={resolvedUnit[this.state.currentUnit]}
                />
                <CitySelector
                    cityName={this.state.currentCity}
                    onCityChange={this.handleCityChange}
                />
                <UnitSelector
                    unit={this.state.currentUnit}
                    onUnitChange={this.handleUnitChange}
                />
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));