// League of Skins
// Ahbab Ashraf

import { useEffect, useState } from 'react';
import axios, { all } from 'axios';
import Select from 'react-select'
import Modal from "react-modal";
import './App.css';

function App() {

	const [version, setVersion] = useState("");

	useEffect(() => {
		getAllChampData();
		getVersion();
	}, []);

	const CHAMP_IMG_URL = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/';
	const CHAMP_SPLASH_URL = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/';

	const [champSearch, setChampSearch] = useState("none");
	const [champData, setChampData] = useState([]);
	const [allChampData, setAllChampData] = useState([]);

	function getChampData() {
		axios.get("http://localhost:4000/champInfo", { params: { champName: champSearch } })
			.then(function (response) {
				setChampData(response.data);
			}).catch(function (error) {
				console.log(error);
			});
	}

	function getVersion() {
		axios.get("http://localhost:4000/version")
			.then(function (response) {
				setVersion(response.data);
				console.log(version);
			}).catch(function (error) {
				console.log(error);
			});
	}

	function getAllChampData() {
		axios.get("http://localhost:4000/allChamps")
			.then(function (response) {
				setAllChampData(response.data);
			}).catch(function (error) {
				console.log(error);
			});
	}

	function ImagePopup({ image, name }) {
		const [isOpen, setIsOpen] = useState(false);

		const toggleModal = () => {
			setIsOpen(!isOpen);
		}

		// Making youtube link
		let ytSearch = " skin spotlight";

		// Special case for default skins
		// Won't show up in yt search otherwise
		if (name != 'Default') {
			ytSearch = name + ytSearch;
		} else {
			ytSearch = 'Classic ' + champData.name + ytSearch;
		}

		ytSearch = ytSearch.replaceAll(' ', '+'); // Replace space with +
		let ytURL = 'http://www.youtube.com/results?search_query=' + ytSearch;

		return (
			<div className='splash' onClick={toggleModal}>
				<img
					src={image}
					alt="no image"
				/>
				
			  	<Modal
					isOpen={isOpen}
					onRequestClose={toggleModal}
					contentLabel="My dialog"
					className="mymodal"
					overlayClassName="myoverlay"
					closeTimeoutMS={500}
				>
					<div>
						<img
							className="image-popup"
							src={image}
							onClick={toggleModal}
							alt="no image"
						/>
						<h2> {name} </h2>
						<a href={ytURL} target="_blank" color='royalblue'> Skin Spotlight </a>
					</div>
				</Modal>
			</div>
		);
	}

	function Splash({ skin }) {
		let skinName = skin.name;
		skinName = skinName.charAt(0).toUpperCase() + skinName.slice(1); // Capitalize first letter of skin name
		let skinURL = CHAMP_SPLASH_URL + champData.name + "_" + skin.num + ".jpg";
		return (
			<ImagePopup key={skinName} image={skinURL} name={skinName} />
		);
	}

	function Splashes() {
		return (
			<div className='splashes-div'>
				{champData.skins.map((skin) => 
					<Splash key={skin.id} skin={skin}/>
				)}
			</div>
		)
	}

	function Names() {
		let champNames = Object.keys(allChampData);
		let champOptions = []
		champNames.forEach((champ) => {
			champOptions.push( {value: champ, label: champ})
		})

		const handleChange = (selectedOption) => {
			setChampSearch(selectedOption.value);
			console.log(`Option selected:`, selectedOption);
		};

		return (
			<div className='champ-dropdown-div'>
				<Select 
					label={'Champ Search Dropdown'}
					options={champOptions}
					onChange={handleChange}
					value={champOptions.filter(function(option) {
						return option.value === champSearch;
					})}
					theme={(theme) => ({
						...theme,
						borderRadius: 0,
						colors: {
						...theme.colors,
						  text: 'orangered',
						  primary25: 'hotpink',
						  primary: 'black',
						},
					})}
				/>
			</div>
		)
	}

	function ChampSummary() {
		const [isOpen, setIsOpen] = useState(false);

		const toggleModal = () => {
			setIsOpen(!isOpen);
		}

		return (
			<div className='summary-div' onClick={toggleModal}>
				<h2>{champData.name}</h2>
				<img height="100" width="100" src={CHAMP_IMG_URL + champData.image.full} alt="xd"></img>
				<Modal
					isOpen={isOpen}
					onRequestClose={toggleModal}
					contentLabel="My dialog"
					className="mymodal"
					overlayClassName="myoverlay"
					closeTimeoutMS={500}
				>
					<div style={{display: 'flex', 'flex-direction': 'column', alignItems: 'center'}}>
						<h2 style={{'margin-bottom': '-10px'}}>{champData.name}</h2>
						<h4> { champData.title} </h4>
						<img src={CHAMP_IMG_URL + champData.image.full} alt="xd"></img>
						<p> {champData.lore} </p>
					</div>
				</Modal>
			</div>
		)
	}

	return (
		<div className="App">
			<h1>League of Skins</h1>

			<Names/>
			<div><button onClick={getChampData}> Search </button></div> <br></br>	

			{champData.length !== 0 ?
				<div>
					<ChampSummary/>
					<Splashes/>
				</div>
				:
				<></>
			}
		</div>
	);
}

export default App;
