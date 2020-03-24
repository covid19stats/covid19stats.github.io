import { InputLabel, MenuItem, Select } from '@material-ui/core';
import moment from 'moment';
import Papa from 'papaparse';
import React, { ChangeEvent, useState } from 'react';
import './App.css';
import { CountryAllChart } from './Components/CountryAllChart';
import loading from './loading.svg';
import { Dictionary, TByCountry, TByCountryRowKey, TByCountrySummary, TByCountrySummaryKey } from './types';

function App() {

  const confirmedUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
  const deathsUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
  const recoveredUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';

  const [isLoaded, setLoaded] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [byCountry, setByCountry] = useState({} as TByCountry);
  const [countriesSorted, setCountriesSorted] = useState([] as string[]);
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
        setCountriesSorted(countriesByConfirmed);
        setLoaded(true);
        setLoading(false);
      });

    } else if(lastOrderBy !== orderBy || lastOrderDir !== orderDir) {
      setLoading(true);
      const countriesSorted: string[] = sortCountriesBy(byCountrySummary, orderBy, orderDir);
      setLastOrderBy(orderBy);
      setLastOrderDir(orderDir);
      console.log('countriesSorted', countriesSorted);
      setCountriesSorted(countriesSorted);
      setLoading(false);
    }
  }

  const handleOrderBySelect = (event: React.ChangeEvent<{ name?: string; value: unknown }>, child: React.ReactNode,) => {
    console.log('handleOrderBySelect val', event.target.value);
    // @ts-ignore
    setOrderBy(event.target.value);
  };

  const handleOrderDirSelect = (event: React.ChangeEvent<{ name?: string; value: unknown }>, child: React.ReactNode,) => {
    console.log('handleOrderDirSelect val', event.target.value);
    // @ts-ignore
    setOrderDir(event.target.value);
  };

  return (
    <div className="App">
      <div className="App-content">

        <header className="header">
          <h1>Coronavirus COVID-19 Statistic Charts</h1>
          <p><small>(data source: <a href="https://github.com/CSSEGISandData/COVID-19">https://github.com/CSSEGISandData/COVID-19</a>)</small></p>
        </header>

        {countriesSorted.length > 0 &&
        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-end">

              <div className="mr-4">Order by:</div>
              <Select id="orderBy" value={orderBy} onChange={handleOrderBySelect} className="mr-2">
                <MenuItem value="confirmed">confirmed</MenuItem>
                <MenuItem value="active">active</MenuItem>
                <MenuItem value="recovered">recovered</MenuItem>
                <MenuItem value="deaths">deaths</MenuItem>
                <MenuItem value="firstContactDate">first contact date</MenuItem>
              </Select>

              <Select id="orderDir" value={orderDir} onChange={handleOrderDirSelect}>
                <MenuItem value="desc">desc</MenuItem>
                <MenuItem value="asc">asc</MenuItem>
              </Select>

            </div>
          </div>
          <div className="row">
            {countriesSorted.map((country, i) => (
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

        {countriesSorted.length === 0 &&
        <img src={loading} className="App-logo" alt="loading" />
        }

        <footer>
          <p><small>Source code available at: <a href="https://github.com/covid19stats/covid19stats.github.io">https://github.com/covid19stats/covid19stats.github.io</a>.</small></p>
          <p><small>Suggestions and Pull Requests are very welcome.</small></p>
        </footer>

      </div>
    </div>
  );
}

const sortCountriesBy = (byCountrySummary: TByCountrySummary, key: TByCountrySummaryKey, order: 'desc' | 'asc' = 'desc') => Object.keys(byCountrySummary).sort((c1: string, c2: string) => {
  let sortOrder = order;
  const v1 = byCountrySummary[c1][key];
  const v2 = byCountrySummary[c2][key];
  if (key === 'firstContactDate') {
    // reorder for dates
    sortOrder = (order === 'desc') ? 'asc' : 'desc';
  }
  if (sortOrder === 'desc') {
    // console.log('sortCountriesBy ', c1, v1, v2, v1 === v2 ? 0 : v1 < v2 ? 1 : -1);
    if (v1 === undefined) return -1;
    if (v2 === undefined) return 1;
    return v1 === v2 ? 0 : v1 < v2 ? 1 : -1;
  }
  // console.log('sortCountriesBy ', c1, v1, v2, v1 === v2 ? 0 : v1 > v2 ? 1 : -1);
  if (v1 === undefined) return 1;
  if (v2 === undefined) return -1;
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
    if (country) {
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
  }
};

const getCountrySummary = (byCountry: TByCountry): TByCountrySummary => {
  const byCountrySummary: TByCountrySummary = {};
  Object.keys(byCountry).forEach((country) => {
    const confKeys = Object.keys(byCountry[country].confirmed);
    const confVals = Object.values(byCountry[country].confirmed);

    const confVals2 = Object.values(byCountry[country].confirmed);
    let reversedConfVals = confVals2.reverse();
    const confirmed = reversedConfVals.find(v => v > 0) || 0;

    const recVals = Object.values(byCountry[country].recovered);
    let reversedRecVals = recVals.reverse();
    const recovered = reversedRecVals.find(v => v > 0) || 0;

    const deVals = Object.values(byCountry[country].deaths);
    let reversedDeVals = deVals.reverse();
    const deaths = reversedDeVals.find(v => v > 0) || 0;

    const firstContactDate = confKeys[confVals.findIndex(n => n > 0)] || moment().format('YYYY-MM-DD');

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
