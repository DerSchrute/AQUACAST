/* AQUACAST v0.6 demo data. Consumption records/forecasts are fictional; tariff matrix transcribed from the BACIWA schedule supplied by the user. */
(() => {
  const stations = [
    {"id":"NO-01","name":"Bago City","province":"Negros Occidental","username":"bagocity","password":"station123"},
    {"id":"NO-02","name":"Binalbagan","province":"Negros Occidental","username":"binalbagan","password":"station123"},
    {"id":"NO-03","name":"Cadiz City","province":"Negros Occidental","username":"cadizcity","password":"station123"},
    {"id":"NO-04","name":"Calatrava","province":"Negros Occidental","username":"calatrava","password":"station123"},
    {"id":"NO-05","name":"Candoni","province":"Negros Occidental","username":"candoni","password":"station123"},
    {"id":"NO-06","name":"Cauayan","province":"Negros Occidental","username":"cauayan","password":"station123"},
    {"id":"NO-07","name":"Don Salvador Benedicto","province":"Negros Occidental","username":"donsalvadorbenedicto","password":"station123"},
    {"id":"NO-08","name":"Enrique B. Magalona","province":"Negros Occidental","username":"enriquebmagalona","password":"station123"},
    {"id":"NO-09","name":"Escalante City","province":"Negros Occidental","username":"escalantecity","password":"station123"},
    {"id":"NO-10","name":"Himamaylan City","province":"Negros Occidental","username":"himamaylancity","password":"station123"},
    {"id":"NO-11","name":"Hinigaran","province":"Negros Occidental","username":"hinigaran","password":"station123"},
    {"id":"NO-12","name":"Hinoba-an","province":"Negros Occidental","username":"hinobaan","password":"station123"},
    {"id":"NO-13","name":"Ilog","province":"Negros Occidental","username":"ilog","password":"station123"},
    {"id":"NO-14","name":"Isabela","province":"Negros Occidental","username":"isabela","password":"station123"},
    {"id":"NO-15","name":"Kabankalan City","province":"Negros Occidental","username":"kabankalancity","password":"station123"},
    {"id":"NO-16","name":"La Carlota City","province":"Negros Occidental","username":"lacarlotacity","password":"station123"},
    {"id":"NO-17","name":"La Castellana","province":"Negros Occidental","username":"lacastellana","password":"station123"},
    {"id":"NO-18","name":"Manapla","province":"Negros Occidental","username":"manapla","password":"station123"},
    {"id":"NO-19","name":"Moises Padilla","province":"Negros Occidental","username":"moisespadilla","password":"station123"},
    {"id":"NO-20","name":"Murcia","province":"Negros Occidental","username":"murcia","password":"station123"},
    {"id":"NO-21","name":"Pontevedra","province":"Negros Occidental","username":"pontevedra","password":"station123"},
    {"id":"NO-22","name":"Pulupandan","province":"Negros Occidental","username":"pulupandan","password":"station123"},
    {"id":"NO-23","name":"Sagay City","province":"Negros Occidental","username":"sagaycity","password":"station123"},
    {"id":"NO-24","name":"San Carlos City","province":"Negros Occidental","username":"sancarloscity","password":"station123"},
    {"id":"NO-25","name":"San Enrique","province":"Negros Occidental","username":"sanenrique","password":"station123"},
    {"id":"NO-26","name":"Silay City","province":"Negros Occidental","username":"silaycity","password":"station123"},
    {"id":"NO-27","name":"Sipalay City","province":"Negros Occidental","username":"sipalaycity","password":"station123"},
    {"id":"NO-28","name":"Talisay City","province":"Negros Occidental","username":"talisaycity","password":"station123"},
    {"id":"NO-29","name":"Toboso","province":"Negros Occidental","username":"toboso","password":"station123"},
    {"id":"NO-30","name":"Valladolid","province":"Negros Occidental","username":"valladolid","password":"station123"},
    {"id":"NO-31","name":"Victorias City","province":"Negros Occidental","username":"victoriascity","password":"station123"},
    {"id":"NOR-01","name":"Amlan","province":"Negros Oriental","username":"amlan","password":"station123"},
    {"id":"NOR-02","name":"Ayungon","province":"Negros Oriental","username":"ayungon","password":"station123"},
    {"id":"NOR-03","name":"Bacong","province":"Negros Oriental","username":"bacong","password":"station123"},
    {"id":"NOR-04","name":"Bais City","province":"Negros Oriental","username":"baiscity","password":"station123"},
    {"id":"NOR-05","name":"Basay","province":"Negros Oriental","username":"basay","password":"station123"},
    {"id":"NOR-06","name":"Bayawan City","province":"Negros Oriental","username":"bayawancity","password":"station123"},
    {"id":"NOR-07","name":"Bindoy","province":"Negros Oriental","username":"bindoy","password":"station123"},
    {"id":"NOR-08","name":"Canlaon City","province":"Negros Oriental","username":"canlaoncity","password":"station123"},
    {"id":"NOR-09","name":"Dauin","province":"Negros Oriental","username":"dauin","password":"station123"},
    {"id":"NOR-10","name":"Dumaguete City","province":"Negros Oriental","username":"dumaguetecity","password":"station123"},
    {"id":"NOR-11","name":"Guihulngan City","province":"Negros Oriental","username":"guihulngancity","password":"station123"},
    {"id":"NOR-12","name":"Jimalalud","province":"Negros Oriental","username":"jimalalud","password":"station123"},
    {"id":"NOR-13","name":"La Libertad","province":"Negros Oriental","username":"lalibertad","password":"station123"},
    {"id":"NOR-14","name":"Mabinay","province":"Negros Oriental","username":"mabinay","password":"station123"},
    {"id":"NOR-15","name":"Manjuyod","province":"Negros Oriental","username":"manjuyod","password":"station123"},
    {"id":"NOR-16","name":"Pamplona","province":"Negros Oriental","username":"pamplona","password":"station123"},
    {"id":"NOR-17","name":"San Jose","province":"Negros Oriental","username":"sanjose","password":"station123"},
    {"id":"NOR-18","name":"Santa Catalina","province":"Negros Oriental","username":"santacatalina","password":"station123"},
    {"id":"NOR-19","name":"Siaton","province":"Negros Oriental","username":"siaton","password":"station123"},
    {"id":"NOR-20","name":"Sibulan","province":"Negros Oriental","username":"sibulan","password":"station123"},
    {"id":"NOR-21","name":"Tanjay City","province":"Negros Oriental","username":"tanjaycity","password":"station123"},
    {"id":"NOR-22","name":"Tayasan","province":"Negros Oriental","username":"tayasan","password":"station123"},
    {"id":"NOR-23","name":"Valencia","province":"Negros Oriental","username":"valencia","password":"station123"},
    {"id":"NOR-24","name":"Vallehermoso","province":"Negros Oriental","username":"vallehermoso","password":"station123"},
    {"id":"NOR-25","name":"Zamboanguita","province":"Negros Oriental","username":"zamboanguita","password":"station123"},
    {"id":"SIQ-01","name":"Enrique Villanueva","province":"Siquijor","username":"enriquevillanueva","password":"station123"},
    {"id":"SIQ-02","name":"Larena","province":"Siquijor","username":"larena","password":"station123"},
    {"id":"SIQ-03","name":"Lazi","province":"Siquijor","username":"lazi","password":"station123"},
    {"id":"SIQ-04","name":"Maria","province":"Siquijor","username":"maria","password":"station123"},
    {"id":"SIQ-05","name":"San Juan","province":"Siquijor","username":"sanjuan","password":"station123"},
    {"id":"SIQ-06","name":"Siquijor","province":"Siquijor","username":"siquijor","password":"station123"}
  ];
  const periods = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026"];
  const records = [];
  const anomalies = [];
  stations.forEach((station, si) => {
    const base = 28 + ((si * 17) % 95);
    periods.forEach((period, i) => {
      const consumption = Math.max(8, base + ((i * 7 + si * 3) % 19) - 7 + Math.floor(i * 0.7));
      const flagged = (i === 6 && si % 7 === 0) || (i === 8 && si % 11 === 0);
      records.push({period, station:station.id, consumption, status:flagged ? 'Flagged' : 'Normal'});
      if (flagged) anomalies.push({id:`FLAG-${String(si+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,period,station:station.id,value:consumption,reason:'Illustrative synthetic observation flagged for review; not a real incident or finding.',status:'Open',region:station.province});
    });
  });
  window.AQUACAST_DATA = {
    unit:'m³', periods, stations, records, anomalies,
    illustrativeForecast:{'Jan 2027':162,'Feb 2027':165,'Mar 2027':163,'Apr 2027':168,'May 2027':171,'Jun 2027':174},
    baciwaTariffSchedule: {
      sourceLabel: 'BACIWA tariff table supplied by user',
      effectiveDate: 'Not verified from the supplied image',
      classifications: {
        residential: { label: 'Residential/Government', rates: [22.32,23.73,25.91,31.35,37.03,44.54], minimumBySize: {
          '1/2':216.96, '3/4':347.14, '1':694.29, '1 1/2':1735.72, '2':4339.30, '3':7810.73, '4':15621.47, '6':26035.73, '8':41657.24, '10':59882.23
        }},
        commercial: { label: 'Commercial/Industrial', rates: [44.64,47.46,53.82,62.69,74.06,89.08], minimumBySize: {
          '1/2':433.93, '3/4':694.29, '1':1388.57, '1 1/2':3471.44, '2':8678.59, '3':15621.47, '4':31242.93, '6':52071.55, '8':83114.48, '10':119764.56
        }}
      },
      sizes: [
        {value:'1/2',label:'½ inch'}, {value:'3/4',label:'¾ inch'}, {value:'1',label:'1 inch'},
        {value:'1 1/2',label:'1½ inches'}, {value:'2',label:'2 inches'}, {value:'3',label:'3 inches'},
        {value:'4',label:'4 inches'}, {value:'6',label:'6 inches'}, {value:'8',label:'8 inches'}, {value:'10',label:'10 inches'}
      ]
    },
    defaultTariffs: Object.fromEntries(stations.map(s=>[s.id,{classification:'residential',size:'1/2',effective:'2026-01-01'}]))
  };
})();
