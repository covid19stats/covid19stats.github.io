import Papa from 'papaparse';
import React, { ChangeEvent, useState } from 'react';
import './App.css';
import { CountryAllChart } from './Components/CountryAllChart';
import {
  Dictionary,
  IByCountrySummaryRow,
  TByCountry,
  TByCountryRowKey,
  TByCountrySummary,
  TByCountrySummaryKey,
} from './types';
import moment from 'moment';

function App() {

  const confirmedUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
  const deathsUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
  const recoveredUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';

  const [isLoaded, setLoaded] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [byCountry, setByCountry] = useState({} as TByCountry);
  const [countriesByConfirmed, setCountriesByConfirmed] = useState([] as string[]);
  const [byCountrySummary, setByCountrySummary] = useState({} as TByCountrySummary);
  const [orderBy, setOrderBy] = useState('confirmed' as TByCountrySummaryKey);
  const [orderDir, setOrderDir] = useState('desc' as 'desc' | 'asc');
  const [lastOrderBy, setLastOrderBy] = useState('' as TByCountrySummaryKey);
  const [lastOrderDir, setLastOrderDir] = useState('' as 'desc' | 'asc');

  if (!isLoading) {
    if (!isLoaded) {
      setLoading(true);
      Promise.all([getCsvData(confirmedUrl), getCsvData(recoveredUrl), getCsvData(deathsUrl)]).then(([confirmed, recovered, deaths]) => {
        const byCountry: TByCountry = {};
        addDataToCountry(byCountry, confirmed.data, 'confirmed');
        addDataToCountry(byCountry, recovered.data, 'recovered');
        addDataToCountry(byCountry, deaths.data, 'deaths');
        addActiveDataToCountry(byCountry);
        console.log('byCountry', byCountry);
        const byCountrySummary: TByCountrySummary = getCountrySummary(byCountry);
        console.log('byCountrySummary', byCountrySummary);
        const countriesByConfirmed: string[] = sortCountriesBy(byCountrySummary, orderBy, orderDir);
        setLastOrderBy(orderBy);
        setLastOrderDir(orderDir);
        setByCountry(byCountry);
        setByCountrySummary(byCountrySummary);
        setCountriesByConfirmed(countriesByConfirmed);
        setLoaded(true);
        setLoading(false);
      });

    } else if(lastOrderBy !== orderBy || lastOrderDir !== orderDir) {
      setLoading(true);
      const countriesByConfirmed: string[] = sortCountriesBy(byCountrySummary, orderBy, orderDir);
      setLastOrderBy(orderBy);
      setLastOrderDir(orderDir);
      setCountriesByConfirmed(countriesByConfirmed);
      setLoading(false);
    }
  }

  const handleOrderBySelect = (val: ChangeEvent<HTMLSelectElement>) => {
    console.log('handleOrderBySelect val', val.target.value);
    // @ts-ignore
    setOrderBy(val.target.value);
  };

  const handleOrderDirSelect = (val: ChangeEvent<HTMLSelectElement>) => {
    console.log('handleOrderDirSelect val', val.target.value);
    // @ts-ignore
    setOrderDir(val.target.value);
  };

  return (
    <div className="App">
      <div className="App-content">

        <header className="header">
          <h1>Coronavirus COVID-19 Stat Charts</h1>
        </header>

        {countriesByConfirmed.length > 0 &&
        <div className="container">
          <div className="row">
            <div className="col-12">
              Order by: <select value={orderBy} onChange={handleOrderBySelect}>
              <option value="confirmed">confirmed</option>
              <option value="active">active</option>
              <option value="recovered">recovered</option>
              <option value="deaths">deaths</option>
              <option value="firstContactDate">first contact date</option>
            </select>
              <select value={orderDir} onChange={handleOrderDirSelect}>
                <option value="desc">desc</option>
                <option value="asc">asc</option>
              </select>
            </div>
          </div>
          <div className="row">
            {countriesByConfirmed.map((country, i) => (
              <CountryAllChart
                country={country}
                summary={byCountrySummary[country]}
                data={byCountry[country]}
                key={country}
              ></CountryAllChart>
            ))}
          </div>
        </div>
        }

      </div>
    </div>
  );
}

const sortCountriesBy = (byCountrySummary: TByCountrySummary, key: TByCountrySummaryKey, order: 'desc' | 'asc' = 'desc') => Object.keys(byCountrySummary).sort((c1: string, c2: string) => {
  const v1 = byCountrySummary[c1][key];
  const v2 = byCountrySummary[c2][key];
  if (order === 'desc') {
    return v1 === v2 ? 0 : v1 < v2 ? 1 : -1;
  }
  return v1 === v2 ? 0 : v1 > v2 ? 1 : -1;
});

const addActiveDataToCountry = (destination: TByCountry) => {
  const countries = Object.keys(destination);
  for (let i = 0; i < countries.length; i += 1) {
    const country = countries[i];
    const countryRow = destination[country];
    const dates = Object.keys(countryRow.confirmed);
    for (let j = 0; j < dates.length; j += 1) {
      const date = dates[j];
      countryRow.active[date] = countryRow.confirmed[date] - countryRow.recovered[date] - countryRow.deaths[date];
    }
  }
};

const addDataToCountry = (destination: TByCountry, dataInput: Dictionary<string>[], key: TByCountryRowKey) => {
  for (let i = 0; i < dataInput.length; i += 1) {
    const row = dataInput[i];
    const country = row['Country/Region'];
    if (!destination[country]) {
      destination[country] = {
        confirmed: {},
        recovered: {},
        deaths: {},
        active: {},
      };
    }

    const dateKeys = Object.keys(row).filter(k => k.match(/[0-9/]{6,}/));
    dateKeys.forEach(date => {
      const reformattedDate = moment(date, 'M/D/YY').format('YYYY-MM-DD');
      destination[country][key][reformattedDate] = parseInt(row[date]) + (destination[country][key][reformattedDate] | 0);
    });
  }
};

const getCountrySummary = (byCountry: TByCountry): TByCountrySummary => {
  const byCountrySummary: TByCountrySummary = {};
  Object.keys(byCountry).forEach((country) => {
    const confKeys = Object.keys(byCountry[country].confirmed);
    const confVals = Object.values(byCountry[country].confirmed);
    const recKeys = Object.keys(byCountry[country].recovered);
    const deKeys = Object.keys(byCountry[country].deaths);
    const confirmed = byCountry[country].confirmed[confKeys[confKeys.length - 1]];
    const recovered = byCountry[country].recovered[recKeys[recKeys.length - 1]];
    const deaths = byCountry[country].deaths[deKeys[deKeys.length - 1]];

    const firstContactDate = confKeys[confVals.findIndex(n => n > 0)];

    byCountrySummary[country] = {
      firstContactDate,
      confirmed,
      recovered,
      deaths,
      active: confirmed - recovered - deaths,
    };
  });
  return byCountrySummary;
};

async function getCsvData(url: string) {
  let csvData = await fetchCsv(url);

  return Papa.parse(csvData, { header: true });
}

async function fetchCsv(url: string) {
  return fetch(url).then(function (response) {
    if (!response.body) {
      return '';
    }
    let reader = response.body.getReader();
    let decoder = new TextDecoder('utf-8');

    return reader.read().then(function (result) {
      return decoder.decode(result.value);
    });
  });
}

export default App;
