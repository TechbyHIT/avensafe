/**
 * Expands published cities (district headquarters not yet covered) and writes
 * locality seeds for every city into data/city-localities.json.
 *
 *   npx tsx scripts/expand-cities-and-localities.ts
 *   npx tsx scripts/expand-cities-and-localities.ts --dry-run
 *   npx tsx scripts/expand-cities-and-localities.ts --min-localities=28
 *
 * After this, run: npx tsx scripts/seed-city-localities.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  citiesFileSchema,
  type City,
  type District,
  type State,
  type TraitKey,
} from '../lib/data/schemas';
import { slugify } from '../lib/utils/text';

const dryRun = process.argv.includes('--dry-run');
const minLocalities = Number(
  process.argv.find((arg) => arg.startsWith('--min-localities='))?.split('=')[1] ??
    '28',
);

const citiesPath = resolve('data/cities.json');
const localitiesPath = resolve('data/city-localities.json');
const districtsPath = resolve('data/districts.json');
const statesPath = resolve('data/states.json');

const cities = citiesFileSchema.parse(JSON.parse(readFileSync(citiesPath, 'utf8')));
const districts = JSON.parse(readFileSync(districtsPath, 'utf8')) as District[];
const states = JSON.parse(readFileSync(statesPath, 'utf8')) as State[];
const existingLocalities = JSON.parse(readFileSync(localitiesPath, 'utf8')) as Record<
  string,
  { name: string; slug?: string }[]
>;

const stateById = new Map(states.map((state) => [state.id, state]));

const STATE_PIN_RANGE: Record<string, readonly [number, number]> = {
  'st-telangana': [500, 509],
  'st-andhra-pradesh': [515, 535],
  'st-karnataka': [560, 591],
  'st-tamil-nadu': [600, 643],
  'st-kerala': [670, 695],
  'st-maharashtra': [400, 445],
  'st-odisha': [751, 770],
  'st-goa': [403, 403],
};

/** Real / commonly searched localities for cities already in the corpus. */
const MAJOR_LOCALITIES: Record<string, readonly string[]> = {
  hyderabad: [
    'Gachibowli', 'Hitech City', 'Madhapur', 'Kondapur', 'Kukatpally', 'Miyapur',
    'Bachupally', 'Nizampet', 'KPHB', 'Jubilee Hills', 'Banjara Hills', 'Manikonda',
    'Tellapur', 'Narsingi', 'Financial District', 'Nanakramguda', 'Kokapet',
    'Puppalaguda', 'Raidurg', 'Ameerpet', 'SR Nagar', 'Begumpet', 'Secunderabad',
    'Uppal', 'LB Nagar', 'Dilsukhnagar', 'Alwal', 'Kompally', 'Suchitra', 'ECIL',
    'AS Rao Nagar', 'Malkajgiri', 'Kushaiguda', 'Habsiguda', 'Tarnaka', 'Mehdipatnam',
    'Tolichowki', 'Attapur', 'Rajendranagar', 'Shamshabad', 'Chandanagar', 'Lingampally',
    'Hafeezpet', 'Serilingampally', 'Patancheru', 'Sangareddy Road', 'Boduppal',
    'Nagole', 'Vanastalipuram', 'Hayathnagar',
  ],
  warangal: [
    'Hanamkonda', 'Kazipet', 'Subedari', 'Hunter Road', 'Mulugu Road', 'Nakkalagutta',
    'Enumamula', 'Mattewada', 'Desaipet', 'Lashkar Bazar', 'Ku Bandham', 'Fort Road',
    'Warangal Public Garden', 'Rangashaipet', 'Somidi', 'Madikonda', 'Gorrekunta',
    'Adilabad Chowrastha', 'Kashibugga', 'Waddepally', 'Peddammagudi', 'Bheemaram',
    'Hasanparthy', 'Inavolu', 'Mamnoor', 'Parkal Road', 'Geesugonda', 'Sangem',
  ],
  nizamabad: [
    'Armoor Road', 'Hyderabad Road', 'Dichpally', 'Nagaram', 'Khaleelwadi', 'Vinayak Nagar',
    'Subhash Nagar', 'Gandhinagar', 'Saraswathi Nagar', 'Tilak Gardens', 'Bodhan Road',
    'Kamareddy Road', 'Dubba', 'Yellammagutta', 'Queens Park', 'Ashok Nagar',
    'Indira Nagar', 'RTC Complex', 'Collectorate', 'Bank Street', 'Phulong', 'Dharmaram',
    'Bardipur', 'Jankampet', 'Mubarak Nagar', 'Shakarnagar', 'Chandrashekhar Nagar', 'Kotagiri',
  ],
  karimnagar: [
    'Mukarampura', 'Choppadandi Road', 'Rekurthi', 'Vavilalapally', 'Bommakal',
    'Karimnagar Bus Stand', 'Collectorate', 'Kaman', 'Godavarikhani Road', 'Jyothinagar',
    'Mankammathota', 'Housing Board', 'Padmanagar', 'Christian Colony', 'Sircilla Road',
    'LMD Colony', 'Kothapally', 'Choppadandi', 'Gangadhara', 'Huzurabad Road',
    'Thimmapur', 'Bejjanki', 'Manakondur', 'Chintakunta', 'Jagtial Road', 'Vemulawada Road',
    'Shanthisagar', 'Industrial Estate',
  ],
  khammam: [
    'Wyra Road', 'Rotary Nagar', 'Gandhi Chowk', 'Mamillagudem', 'Ballepalli',
    'Khammam Bus Stand', 'Collectorate', 'ZPHS Area', 'Dhamsalapuram', 'Pakabanda',
    'Burhanpuram', 'Nasarpur', 'Khanapuram Haveli', 'Venkatagiri', 'Indira Nagar',
    'Ashok Nagar', 'Srinagar Colony', 'Kothagudem Road', 'Sathupalli Road', 'Yellandu Road',
    'Madhira Road', 'Nelakondapalli', 'Mudigonda', 'Konijerla', 'Kusumanchi', 'Tirumalayapalem',
    'Raghunadhapalem', 'Industrial Area',
  ],
  visakhapatnam: [
    'MVP Colony', 'Lawsons Bay', 'Seethammadhara', 'Madhurawada', 'Rushikonda', 'Yendada',
    'Gajuwaka', 'Kurmannapalem', 'NAD Junction', 'Akkayyapalem', 'Dwaraka Nagar',
    'Siripuram', 'Beach Road', 'Jagadamba', 'Asilmetta', 'Pendurthi', 'Gopalapatnam',
    'Kancharapalem', 'Malkapuram', 'Sheela Nagar', 'PM Palem', 'Sagar Nagar', 'Bheemili',
    'Anandapuram', 'Kommadi', 'Pedda Waltair', 'Waltair Uplands', 'Resapuvanipalem',
    'Kailasapuram', 'Steel Plant Township',
  ],
  vijayawada: [
    'Benz Circle', 'Patamata', 'Auto Nagar', 'Governorpet', 'Labbipet', 'Mogalrajapuram',
    'Gunadala', 'Bhavanipuram', 'Satyanarayanapuram', 'Machavaram', 'Currency Nagar',
    'Gurunanak Colony', 'Ramavarappadu', 'Poranki', 'Tadigadapa', 'Kanuru', 'Gollapudi',
    'Ibrahimpatnam', 'Enikepadu', 'Payakapuram', 'Ajit Singh Nagar', 'Vidhyadharapuram',
    'Patamata Lanka', 'Krishnalanka', 'One Town', 'Besant Road', 'Suryaraopet', 'Gandhi Nagar',
  ],
  guntur: [
    'Brodipet', 'Lakshmipuram', 'Arundelpet', 'Kothapet', 'Patnam Bazar', 'RTC Bus Stand',
    'Nagarampalem', 'Syamala Nagar', 'Amaravathi Road', 'Pedakakani', 'Autonagar',
    'Gorantla', 'Namburu', 'Ponnur Road', 'Chandramouli Nagar', 'Reddypalem', 'Etukuru',
    'Ankireddypalem', 'Stacey Road', 'Collectorate', 'Gujjanagundla', 'Mangalagiri Road',
    'Tadepalli Road', 'Perecherla', 'Prathipadu', 'Vengalayapalem', 'Industrial Estate', 'Brindavan Gardens',
  ],
  nellore: [
    'Stonehousepet', 'Magunta Layout', 'AC Nagar', 'Balaji Nagar', 'Nellore Bus Stand',
    'Collectorate', 'Vedayapalem', 'Fathekhanpet', 'Santhapet', 'Harinathapuram',
    'Narayana Reddy Nagar', 'Pogathota', 'Railway Koduru Road', 'Bitragunta Road',
    'Kovur', 'Buchireddypalem', 'Indukurpeta', 'Muthukur Road', 'Sri Potti Sriramulu Nellore',
    'Magunta Layout Extension', 'Chinthareddypalem', 'Akkacheruvupeta', 'Gudur Road',
    'Kavali Road', 'Atmakur Road', 'Industrial Estate', 'Vedayapalem Colony', 'Town Center',
  ],
  tirupati: [
    'Tirumala Road', 'Kapila Theertham', 'Alipiri', 'Bhavani Nagar', 'MRT Colony',
    'Tiruchanur', 'Renigunta Road', 'Srikalahasti Road', 'Air Bypass Road', 'Korlagunta',
    'Settipalle', 'Perur', 'Mangalam', 'Chandragiri Road', 'Leelamahal', 'Kotakommala',
    'Padmavathi Puram', 'Vinayaka Nagar', 'SVU Campus Area', 'Railway Station Area',
    'Bus Stand Area', 'Gandhi Road', 'Town Hall', 'KT Road', 'RC Road', 'Industrial Estate',
    'Thummalagunta', 'Akkarampalle',
  ],
  rajahmundry: [
    'Danavaipeta', 'Morampudi', 'Kotipalli Bus Stand', 'Devi Chowk', 'Innespeta',
    'Alcot Gardens', 'T Nagar', 'Syamala Nagar', 'Hukumpeta', 'Diwancheruvu',
    'Katheru', 'Vemagiri', 'Pidimgoyyi', 'Ayyappa Nagar', 'JL Puram', 'Gandhipuram',
    'Railway Station Area', 'Gokavaram Bus Stand', 'Bommuru', 'Dowleswaram',
    'Kadiyam Road', 'Rajanagaram', 'Korukonda Road', 'Industrial Colony', 'Town Center',
    'Seethampeta', 'Aratlakatta', 'Nallamilli',
  ],
  kakinada: [
    'Sarpavaram Junction', 'Bhanugudi Junction', 'Ramanayyapeta', 'Gandhinagar',
    'Cinema Road', 'Main Road', 'Collectorate', 'Jagannaickpur', 'Madhavapatnam',
    'Turangi', 'Indrapalem', 'Ganganapalli', 'Vakalapudi', 'Port Area', 'Beach Road',
    'NFCL Road', 'Samalkot Road', 'Peddapuram Road', 'Suryaraopeta', 'Ashok Nagar',
    'Ramaraopeta', 'Temple Street', 'Industrial Estate', 'Yetimoga', 'Thimmapuram',
    'Kakinada Rural', 'Pratap Nagar', 'Town Center',
  ],
  bengaluru: [
    'Whitefield', 'Marathahalli', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Jayanagar',
    'JP Nagar', 'BTM Layout', 'Electronic City', 'Sarjapur Road', 'Bellandur', 'Hebbal',
    'Yelahanka', 'Thanisandra', 'Manyata Tech Park', 'Rajajinagar', 'Malleshwaram',
    'Basavanagudi', 'Banashankari', 'Vijayanagar', 'RR Nagar', 'Kengeri', 'Mysore Road',
    'Yeshwanthpur', 'Peenya', 'Devanahalli', 'KR Puram', 'CV Raman Nagar', 'Hennur',
    'Kalyan Nagar', 'Kammanahalli', 'Horamavu', 'Varthur', 'Kadubeesanahalli', 'Brookefield',
    'Mahadevapura', 'Hoodi', 'ITPL Road', 'Domlur', 'Ulsoor',
  ],
  mysuru: [
    'Vijayanagar', 'Gokulam', 'Kuvempunagar', 'Jayalakshmipuram', 'Yadavagiri', 'Bogadi',
    'Hebbal', 'Siddhartha Layout', 'Dattagalli', 'JP Nagar', 'Lakshmipuram', 'Saraswathipuram',
    'Bannimantap', 'Rajarajeshwari Nagar', 'Hinkal', 'Alanahalli', 'Srirampura',
    'Metagalli', 'Industrial Area', 'Nazarbad', 'Chamundi Hill Road', 'Agrahara',
    'Mandi Mohalla', 'Kyathamaranahalli', 'Ramakrishnanagar', 'T Narasipura Road',
    'Hunsur Road', 'Nanjangud Road',
  ],
  mangaluru: [
    'Kadri', 'Bejai', 'Kankanady', 'Pandeshwar', 'Hampankatta', 'Lalbagh', 'Kodialbail',
    'Balmatta', 'Falnir', 'Attavar', 'Bendoorwell', 'Urva', 'Surathkal', 'Kulai',
    'Panambur', 'Moodbidri Road', 'Pumpwell', 'Valencia', 'Derebail', 'Bondel',
    'Kottara', 'Mangaladevi', 'State Bank Area', 'Jyothi Circle', 'Bajpe', 'Airport Road',
    'Industrial Area', 'Thokkottu',
  ],
  hubballi: [
    'Vidyanagar', 'Deshpande Nagar', 'Gokul Road', 'Unkal', 'Keshwapur', 'Navanagar',
    'Airport Road', 'CBT Area', 'Old Hubli', 'Tol Naka', 'Sattur', 'Akshaya Colony',
    'Rajnagar', 'Vidyagiri', 'Bengeri', 'Industrial Estate', 'Gopanakoppa', 'Hosur',
    'Lamington Road', 'Durgadabail', 'Shirur Park', 'Gabbur', 'Amargol', 'Tabbigeri',
    'Nagashettykoppa', 'Rayapur', 'Mantur Road', 'Hubli Station Area',
  ],
  belagavi: [
    'Tilakwadi', 'Shahapur', 'Vadgaon', 'Angol', 'Camp Area', 'Congress Road',
    'Kaktives', 'Nehru Nagar', 'Shivbasava Nagar', 'Mahantesh Nagar', 'Kanabargi',
    'Udyambag', 'Industrial Estate', 'Railway Station Area', 'Bus Stand Area',
    'Fort Area', 'College Road', 'Hindwadi', 'Bhagya Nagar', 'Ramteerth Nagar',
    'Auto Nagar', 'Kakati', 'Peeranwadi', 'Sambra', 'Kangrali', 'Gokak Road',
    'Goaves', 'Malmaruti',
  ],
  chennai: [
    'Adyar', 'Anna Nagar', 'T Nagar', 'Velachery', 'OMR', 'Sholinganallur', 'Perungudi',
    'Thoraipakkam', 'Pallikaranai', 'Tambaram', 'Chromepet', 'Guindy', 'Saidapet',
    'Nungambakkam', 'Egmore', 'Kilpauk', 'Kodambakkam', 'Vadapalani', 'Porur',
    'Maduravoyal', 'Ambattur', 'Avadi', 'Mogappair', 'Kolathur', 'Perambur',
    'Washermanpet', 'Royapuram', 'Mylapore', 'Besant Nagar', 'Thiruvanmiyur',
    'Medavakkam', 'Pallavaram', 'Chromepet GST Road', 'Navalur', 'Kelambakkam',
  ],
  coimbatore: [
    'RS Puram', 'Peelamedu', 'Saibaba Colony', 'Gandhipuram', 'Race Course', 'Sungam',
    'Singanallur', 'Ramanathapuram', 'Kuniyamuthur', 'Vadavalli', 'Thudiyalur',
    'Saravanampatti', 'Kalapatti', 'Hope College', 'Avinashi Road', 'Trichy’s Road',
    'Ukkadam', 'Town Hall', 'Tatabad', 'Kavundampalayam', 'Ganapathy', 'Vilankurichi',
    'Neelambur', 'Sulur', 'Podanur', 'Industrial Estate', 'Sitra', 'Airport Area',
  ],
  madurai: [
    'KK Nagar', 'Anna Nagar', 'Thirunagar', 'Tallakulam', 'Goripalayam', 'Sellur',
    'Villapuram', 'Anaiyur', 'TVS Nagar', 'Mattuthavani', 'Arapalayam', 'Pasumalai',
    'Thiruparankundram', 'Kochadai', 'Avaniyapuram', 'Palanganatham', 'Ellis Nagar',
    'Bibikulam', 'Simmakkal', 'South Gate', 'East Gate', 'West Masi Street',
    'Collectorate', 'Industrial Estate', 'Melur Road', 'Theni Road', 'Dindigul Road', 'Viraganoor',
  ],
  tiruchirappalli: [
    'Srirangam', 'Thillai Nagar', 'Cantonment', 'Woraiyur', 'K.K. Nagar', 'Edamalaipatti Pudur',
    'Mannarpuram', 'Karumandapam', 'Crawford', 'Puthur', 'Tennur', 'Devadanam',
    'Vayalur Road', 'Airport Area', 'Central Bus Stand', 'Rockfort Area', 'Palakkarai',
    'Thiruverumbur', 'Ariyamangalam', 'Kattur', 'Senthaneerpuram', 'Pettavaithalai Road',
    'Industrial Estate', 'BHEL Township', 'Samayapuram', 'Lalgudi Road', 'Golden Rock', 'TVS Tollgate',
  ],
  salem: [
    'Hasthampatti', 'Fairlands', 'Suramangalam', 'Alagapuram', 'Shevapet', 'Ammapet',
    'Five Roads', 'Kannankurichi', 'Kondalampatti', 'Gugai', 'Dadagapatti', 'Seelanaickenpatti',
    'Steel Plant Area', 'Junction Area', 'New Bus Stand', 'Cherry Road', 'Omalur Road',
    'Attur Road', 'Yercaud Road', 'Meyyanur', 'Peramanur', 'Udayapatti', 'Kannankurichi Road',
    'Industrial Estate', 'Narayanavanam', 'Thiruvagoundanur', 'Swarnapuri', 'State Bank Colony',
  ],
  tiruppur: [
    'Kangeyam Road', 'Avinashi Road', 'Palladam Road', 'Dharapuram Road', 'PN Road',
    'College Road', 'Anupparpalayam', 'Angeripalayam', 'Veerapandi', 'Nallur',
    'Tiruppur North', 'Tiruppur South', 'Kumar Nagar', 'Rakkiapalayam', 'Thottipalayam',
    'Industrial Estate', 'Textile Park', 'Bus Stand Area', 'Railway Station Area',
    'Kongu Nagar', 'Perumanallur', 'Avinashipalayam', 'Uthukuli Road', 'Mangalam Road',
    'Cheyur', 'Muthanampalayam', 'S. Periyapalayam', 'Town Center',
  ],
  kochi: [
    'Marine Drive', 'MG Road', 'Panampilly Nagar', 'Kadavanthra', 'Elamkulam', 'Vyttila',
    'Palarivattom', 'Edappally', 'Kakkanad', 'Infopark', 'Kaloor', 'Ernakulam South',
    'Fort Kochi', 'Mattancherry', 'Thevara', 'Willingdon Island', 'Thrippunithura',
    'Thrikkakara', 'Aluva', 'Kalamassery', 'Eloor', 'North Paravur Road', 'Vennala',
    'Ponekkara', 'Pipeline Road', 'Chilavannur', 'Nettoor', 'Maradu',
  ],
  thiruvananthapuram: [
    'Kowdiar', 'Vazhuthacaud', 'Pattom', 'Kesavadasapuram', 'Technopark', 'Kazhakootam',
    'Sreekariyam', 'Ulloor', 'Medical College', 'Thycaud', 'Statue', 'East Fort',
    'Poojappura', 'Vellayambalam', 'Sasthamangalam', 'Peroorkada', 'Kudappanakunnu',
    'Nemom', 'Neyyattinkara Road', 'Attingal Road', 'Kovalam Road', 'Varkala Road',
    'Industrial Estate', 'Pallipuram', 'Kazhakuttom Bypass', 'Akkulam', 'Chackai', 'Pettah',
  ],
  kozhikode: [
    'Mavoor Road', 'Nadia', 'West Hill', 'Beach Road', 'SM Street', 'Palayam',
    'Kottooli', 'Medical College', 'Panniyankara', 'Kallai', 'Feroke', 'Ramanattukara',
    'Kunnamangalam', 'Kakkodi', 'Ernajipalam', 'Eranhipalam', 'Vellayil', 'Puthiyara',
    'Chalappuram', 'Indira Gandhi Road', 'Industrial Estate', 'Bilathikulam', 'Kuttikkattoor',
    'Pantheerankavu', 'Thondayad', 'Kovoor', 'Malaparamba', 'Chevayur',
  ],
  thrissur: [
    'Punkunnam', 'Ayyanthole', 'West Fort', 'East Fort', 'MG Road', 'Kuriachira',
    'Ollur', 'Mannuthy', 'Viyyur', 'Patturaikkal', 'Shornur Road', 'Palace Road',
    'Koorkenchery', 'Chelakkottukara', 'Mission Quarters', 'Poothole', 'Kizhakkumpattukara',
    'Industrial Estate', 'Puzhakkal', 'Laloor', 'Chiyyaram', 'Nedupuzha', 'Mundur',
    'Peramangalam', 'Guruvayur Road', 'Kodungallur Road', 'Irinjalakuda Road', 'Town Center',
  ],
  kannur: [
    'Thalassery Road', 'Payyambalam', 'Fort Road', 'Caltex', 'South Bazar', 'City Center',
    'Thavakkara', 'Kakkad', 'Melechovva', 'Burnacherry', 'Talap', 'Ayikkara',
    'Industrial Estate', 'Railway Station Area', 'Bus Stand Area', 'Mundayad',
    'Chala', 'Kuruva', 'Edakkad', 'Azhikode', 'Mattannur Road', 'Iritty Road',
    'Pappinisseri', 'Valapattanam', 'Chirakkal', 'Kadachira', 'Anjarakandy', 'Town Center',
  ],
  mumbai: [
    'Andheri West', 'Andheri East', 'Bandra West', 'Bandra East', 'Powai', 'Goregaon',
    'Malad', 'Kandivali', 'Borivali', 'Dahisar', 'Jogeshwari', 'Vile Parle', 'Santacruz',
    'Khar', 'Juhu', 'Worli', 'Lower Parel', 'Dadar', 'Matunga', 'Sion', 'Chembur',
    'Ghatkopar', 'Vikhroli', 'Bhandup', 'Mulund', 'Kurla', 'Byculla', 'Colaba',
    'Fort', 'Nariman Point', 'Powai Hiranandani', 'Chandivali', 'Marol', 'Saki Naka',
  ],
  thane: [
    'Thane West', 'Ghodbunder Road', 'Hiranandani Estate', 'Wagle Estate', 'Naupada',
    'Kopri', 'Kalwa', 'Mumbra', 'Diva', 'Bhayander Road', 'Majiwada', 'Kolshet',
    'Owale', 'Manpada', 'Vartak Nagar', 'Lokmanya Nagar', 'Cadbury Junction',
    'Teen Hath Naka', 'Station Area', 'Court Naka', 'Balkum', 'Kasarvadavali',
    'Anand Nagar', 'Dhokali', 'Industrial Area', 'Pokhran Road', 'Yeoor', 'Louiswadi',
  ],
  'navi-mumbai': [
    'Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel', 'Airoli', 'Ghansoli', 'Kopar Khairane',
    'Sanpada', 'Juinagar', 'Seawoods', 'Ulwe', 'Dronagiri', 'Kamothe', 'Kalamboli',
    'New Panvel', 'Taloja', 'Mahape', 'Turbhe', 'CBD Belapur', 'Sector 15 Kharghar',
    'Sector 19 Airoli', 'Industrial Area', 'Palm Beach Road', 'DY Patil Area', 'Bamandongri',
    'Khandeshwar', 'Taloja MIDC',
  ],
  pune: [
    'Hinjewadi', 'Wakad', 'Baner', 'Aundh', 'Kothrud', 'Karve Nagar', 'Warje', 'Katraj',
    'Hadapsar', 'Kharadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park', 'Camp',
    'Deccan', 'Shivajinagar', 'Pimpri', 'Chinchwad', 'Nigdi', 'Ravet', 'Punawale',
    'Bavdhan', 'Pashan', 'Balewadi', 'Magarpatta', 'Mundhwa', 'Wagholi', 'Yerwada',
    'Bibwewadi', 'Sinhagad Road',
  ],
  nashik: [
    'College Road', 'Gangapur Road', 'Indira Nagar', 'Pathardi Phata', 'CIDCO',
    'Satpur', 'Ambad', 'Panchavati', 'Nashik Road', 'Deolali', 'Dwarka', 'Canada Corner',
    'Sharanpur Road', 'Mahatma Nagar', 'Untwadi', 'Makhmalabad', 'Adgaon', 'MIDC Ambad',
    'Sinnar Road', 'Trimbak Road', 'Igatpuri Road', 'Jail Road', 'Ashok Stambh',
    'Ravivar Karanja', 'Industrial Estate', 'Anandwali', 'Hirawadi', 'Upnagar',
  ],
  nagpur: [
    'Dharampeth', 'Ramdaspeth', 'Civil Lines', 'Sitabuldi', 'Sadar', 'Manish Nagar',
    'Pratap Nagar', 'Trimurti Nagar', 'Hingna Road', 'MIDC Hingna', 'Wardha Road',
    'Manewada', 'Besa', 'Pipla', 'Khamla', 'Byramji Town', 'Dhantoli', 'Gandhibagh',
    'Itwari', 'Mahal', 'Koradi Road', 'Kamptee Road', 'Katol Road', 'MIHAN',
    'Butibori', 'Industrial Area', 'Seminary Hills', 'Bajaj Nagar',
  ],
  bhubaneswar: [
    'Patia', 'Chandrasekharpur', 'Infocity', 'Saheed Nagar', 'Jayadev Vihar', 'Nayapalli',
    'Rasulgarh', 'Old Town', 'Lingaraj', 'Khandagiri', 'Pokhariput', 'Dumduma',
    'Lewis Road', 'Unit 1', 'Unit 4', 'Unit 6', 'Unit 9', 'IRC Village', 'Gajapati Nagar',
    'Bomikhal', 'Vani Vihar', 'Acharya Vihar', 'Baramunda', 'Jagamara', 'Tamando',
    'Jatni Road', 'Industrial Estate', 'Pandra',
  ],
  cuttack: [
    'Badambadi', 'College Square', 'Buxi Bazaar', 'Chauliaganj', 'CDA Sector 6',
    'CDA Sector 10', 'Link Road', 'Naya Bazaar', 'Mangalabag', 'Jobra', 'Sikharpur',
    'Mahanadi Vihar', 'Ring Road', 'Industrial Estate', 'Nakhara', 'Niali Road',
    'Bidanasi', 'Sishubhawan', 'Tulasipur', 'Kafla', 'Gandarpur', 'Naya Gaon',
    'Sutahat', 'Choudhury Bazar', 'Kathajodi Road', 'Jagatpur', 'Barabati', 'Town Center',
  ],
  rourkela: [
    'Sector 1', 'Sector 2', 'Sector 5', 'Sector 6', 'Sector 19', 'Chhend', 'Uditnagar',
    'Basanti Colony', 'Koel Nagar', 'Civil Township', 'Fertilizer Township', 'Birsa Vihar',
    'Panposh', 'Jhirpani', 'Industrial Estate', 'Steel Township', 'Bisra Road',
    'Bondamunda', 'Raghunathpali', 'Vedvyas', 'Hamirpur', 'Kalinga Vihar',
    'Basanti Colony Extension', 'Daily Market', 'Station Area', 'Bus Stand Area',
    'Ring Road', 'Town Center',
  ],
  puri: [
    'Grand Road', 'Swargadwar', 'Baliapanda', 'Chakratirtha Road', 'Sea Beach Road',
    'Station Road', 'Bus Stand Area', 'Lokanath Road', 'Gopinathpur', 'Matimandap Sahi',
    'Markandeswar Sahi', 'Dolamandap Sahi', 'Baseli Sahi', 'Industrial Estate',
    'Pentakota', 'Balighai', 'Puri Sadar', 'Chandanpur', 'Pipili Road', 'Konark Road',
    'Satyabadi Road', 'Town Center', 'Hotel Street', 'Nolia Sahi', 'Gudia Sahi',
    'Harachandi Sahi', 'Kundheihaia', 'Talabania',
  ],
  berhampur: [
    'Giri Road', 'Court Road', 'Hillpatna', 'Bhapur Bazar', 'Engineering School Road',
    'Gate Bazar', 'Bus Stand Area', 'Railway Station Area', 'Industrial Estate',
    'Lanjipalli', 'Ambapua', 'Ankushpur', 'Gosaninuagaon', 'City Hospital Road',
    'Neelakantha Nagar', 'Sankarpur', 'Bada Bazaar', 'Town Center', 'Aska Road',
    'Chatrapur Road', 'Gopalpur Road', 'Rangeilunda', 'Narendrapur', 'Koraput Road',
    'Gandhi Nagar', 'Sairam Nagar', 'Lohiya Nagar', 'Bijipur',
  ],
  panaji: [
    'Miramar', 'Campal', 'Altinho', 'Fontainhas', 'St Inez', 'Taleigao', 'Caranzalem',
    'Dona Paula', 'Bambolim', 'Santa Cruz', 'Porvorim Road', 'Merces', 'Chimbel',
    'Ribandar', 'Old Goa Road', 'Patto', 'Bus Stand Area', 'Market Area',
    'Industrial Estate', 'Panaji Port Area', 'Mala', 'Portais', 'Neugi Nagar',
    'Tonca', 'St Cruz Bypass', 'Kadamba Plateau', 'Corlim Road', 'Town Center',
  ],
  margao: [
    'Fatorda', 'Navelim', 'Aquem', 'Borda', 'Comba', 'New Market', 'Old Market',
    'Railway Station Area', 'Bus Stand Area', 'Colva Road', 'Benaulim Road',
    'Madgaon Church Area', 'Industrial Estate', 'Davorlim', 'Nuvem', 'Curtorim',
    'Raia', 'Loutolim Road', 'Cuncolim Road', 'Quepem Road', 'Town Center',
    'Pajifond', 'Malbhat', 'Gogol', 'Vidhyanagar', 'Aquem Alto', 'Pedda', 'Khareband',
  ],
  'vasco-da-gama': [
    'Bogmalo', 'Chicalim', 'Sancoale', 'Verna Road', 'Airport Road', 'Mormugao Harbour',
    'Baina', 'New Vaddem', 'Mangor Hill', 'Mundvel', 'Cortalim Road', 'Issorcim',
    'Industrial Estate', 'Bus Stand Area', 'Railway Station Area', 'Town Center',
    'Desterro', 'Jetty Area', 'Khariwada', 'Mangor', 'Vaddem', 'Alto Dabolim',
    'Zuarinagar', 'Sancoale Industrial', 'Cansaulim Road', 'Velsao', 'Pale', 'Consua',
  ],
  mapusa: [
    'Near Market', 'Altinho Mapusa', 'Duler', 'Khorlim', 'Cunchelim', 'Guirim',
    'Assagao Road', 'Anjuna Road', 'Calangute Road', 'Thivim Road', 'Industrial Estate',
    'Bus Stand Area', 'Town Center', 'Karaswada', 'Colvale Road', 'Moira Road',
    'Siolim Road', 'Aldona Road', 'Porvorim Road', 'Bastora', 'Pomburpa Road',
    'Camurlim', 'Oxel', 'Revora Road', 'Corjuem Road', 'Saligao Road', 'Parra Road', 'Town Market',
  ],
};

const TOWN_LOCALITY_STEMS = [
  'Town Center',
  'Old Town',
  'New Colony',
  'Market Area',
  'Railway Station Area',
  'Bus Stand Road',
  'Collectorate Road',
  'Industrial Estate',
  'Housing Board Colony',
  'Bypass Road',
  'Temple Road',
  'Gandhi Nagar',
  'Nehru Nagar',
  'Sai Nagar',
  'Teachers Colony',
  'Vidya Nagar',
  'RTC Complex Area',
  'Stadium Road',
  'Hospital Road',
  'Court Road',
  'Ashok Nagar',
  'Shanti Nagar',
  'Lakshmi Nagar',
  'Ambedkar Nagar',
  'Indira Nagar',
  'Subhash Nagar',
  'Patel Nagar',
  'Krishna Nagar',
  'Ram Nagar',
  'Venkat Nagar',
  'Auto Nagar',
  'Ring Road Area',
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pinPrefixesFor(stateId: string, slug: string): string[] {
  const range = STATE_PIN_RANGE[stateId] ?? [500, 509];
  const [lo, hi] = range;
  const value = lo + (hashString(slug) % (hi - lo + 1));
  return [String(value).padStart(3, '0')];
}

function traitsFor(state: State): TraitKey[] {
  return [...state.traits];
}

function builtFormFor(state: State, tier: 1 | 2 | 3): City['builtForm'] {
  if (tier === 1 && state.traits.includes('highRise')) return 'high-rise';
  if (tier === 3) return state.coastal ? 'mixed' : 'independent-houses';
  return 'mid-rise';
}

function buildTownLocalities(cityName: string, citySlug: string, count: number): string[] {
  const offset = hashString(citySlug) % TOWN_LOCALITY_STEMS.length;
  const rotated = [
    ...TOWN_LOCALITY_STEMS.slice(offset),
    ...TOWN_LOCALITY_STEMS.slice(0, offset),
  ];
  const names: string[] = [];
  for (const stem of rotated) {
    if (names.length >= count) break;
    const needsPrefix =
      stem === 'Town Center' ||
      stem === 'Old Town' ||
      stem === 'New Colony' ||
      stem === 'Market Area';
    names.push(needsPrefix ? `${cityName} ${stem}` : stem);
  }
  return names;
}

function localitiesForCity(city: City, count: number): { name: string }[] {
  const major = MAJOR_LOCALITIES[city.slug] ?? [];
  const fromFile = (existingLocalities[city.id] ?? []).map((entry) => entry.name);
  const generated = buildTownLocalities(city.name, city.slug, count);
  const merged = [...major, ...fromFile, ...generated];
  const seen = new Set<string>();
  const unique: { name: string }[] = [];
  for (const name of merged) {
    const key = slugify(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({ name });
    if (unique.length >= count) break;
  }
  return unique;
}

function cityIntro(cityName: string, state: State, district: District, tier: 1 | 2 | 3): string {
  const housing =
    tier === 1
      ? 'taller apartment stock and denser society rules'
      : tier === 2
        ? 'mid-rise apartments mixed with independent houses'
        : 'mostly independent houses and low apartment blocks';
  const climate = state.coastal
    ? 'Coastal air and monsoon wetting push us toward marine-grade stainless and careful drainage at terminations'
    : state.traits.includes('arid')
      ? 'The inland dry climate makes ultraviolet exposure the main material stress rather than salt corrosion'
      : 'Local humidity and monsoon patterns shape net twine and inspection intervals more than wind alone';
  return `${cityName} in ${district.name} district, ${state.name}, is a ${housing} market for balcony safety, invisible grills, and netting. ${climate}. Installations here are surveyed against local building stock around ${district.headquarters}, association access rules, and the practical working windows that keep residential towers and houses usable during the job.`;
}

function cityConsiderations(cityName: string, state: State, district: District): string {
  return `Work in ${cityName} is sequenced around access near ${district.headquarters}, local society permissions, and ${state.coastal ? 'salt and monsoon exposure on exposed elevations' : 'heat and UV on open terraces and parapets'}.`;
}

function landmarksFor(cityName: string, district: District): string[] {
  return [
    `${cityName} bus stand`,
    `${district.name} collectorate`,
    `${cityName} market area`,
    `${district.headquarters} town limits`,
  ];
}

const usedDistrictIds = new Set(cities.map((city) => city.districtId));
const usedSlugs = new Set(cities.map((city) => city.slug));
const usedIds = new Set(cities.map((city) => city.id));

const toAdd: City[] = [];

for (const district of districts) {
  if (!district.published) continue;
  if (usedDistrictIds.has(district.id)) continue;

  const state = stateById.get(district.stateId);
  if (!state?.published) continue;

  const name = district.headquarters?.trim() || district.name;
  let slug = slugify(name);
  if (!slug || slug.length < 2) continue;

  // Skip when the headquarters is already represented as a city in this state.
  const hqAlreadyCity = cities.some(
    (city) => city.stateId === district.stateId && city.slug === slug,
  );
  const hqAlreadyPending = toAdd.some(
    (city) => city.stateId === district.stateId && city.slug === slug,
  );
  if (hqAlreadyCity || hqAlreadyPending) continue;

  if (usedSlugs.has(slug)) {
    slug = slugify(`${name}-${district.slug}`);
  }
  if (usedSlugs.has(slug)) continue;

  const id = `ct-${slug}`;
  if (usedIds.has(id)) continue;

  const tier: 1 | 2 | 3 = 3;
  const city: City = {
    id,
    slug,
    name,
    stateId: state.id,
    districtId: district.id,
    tier,
    traits: traitsFor(state),
    builtForm: builtFormFor(state, tier),
    intro: cityIntro(name, state, district, tier),
    localConsiderations: cityConsiderations(name, state, district),
    landmarks: landmarksFor(name, district),
    pincodePrefixes: pinPrefixesFor(state.id, slug),
    neighbouringCityIds: [],
    published: true,
  };

  toAdd.push(city);
  usedDistrictIds.add(district.id);
  usedSlugs.add(slug);
  usedIds.add(id);
}

const mergedCities = [...cities, ...toAdd];

/** Wire up to 5 neighbours within the same state (deterministic by slug). */
function wireNeighbours(all: City[]): City[] {
  const byState = new Map<string, City[]>();
  for (const city of all) {
    if (!city.published) continue;
    const bucket = byState.get(city.stateId) ?? [];
    bucket.push(city);
    byState.set(city.stateId, bucket);
  }

  return all.map((city) => {
    const peers = (byState.get(city.stateId) ?? [])
      .filter((peer) => peer.id !== city.id)
      .sort((a, b) => a.slug.localeCompare(b.slug));
    if (peers.length === 0) return city;

    const start = hashString(city.slug) % peers.length;
    const picked: string[] = [];
    for (let i = 0; i < peers.length && picked.length < 5; i += 1) {
      const peer = peers[(start + i) % peers.length]!;
      picked.push(peer.id);
    }

    const same =
      picked.length === city.neighbouringCityIds.length &&
      picked.every((id, index) => id === city.neighbouringCityIds[index]);
    return same ? city : { ...city, neighbouringCityIds: picked };
  });
}

const finalCities = wireNeighbours(mergedCities);

const localityFile: Record<string, { name: string }[]> = {};
for (const city of finalCities) {
  if (!city.published) continue;
  localityFile[city.id] = localitiesForCity(city, minLocalities);
}

console.log(`\nExpand cities & localities${dryRun ? ' (dry run)' : ''}\n`);
console.log(`  Existing cities : ${cities.length}`);
console.log(`  New cities      : ${toAdd.length}`);
console.log(`  Total cities    : ${finalCities.length}`);
console.log(`  Min localities  : ${minLocalities}`);
console.log(
  `  Locality rows   : ${Object.values(localityFile).reduce((sum, list) => sum + list.length, 0)}`,
);

const byState = states.map((state) => ({
  state: state.slug,
  cities: finalCities.filter((city) => city.stateId === state.id).length,
  newCities: toAdd.filter((city) => city.stateId === state.id).length,
}));
for (const row of byState) {
  console.log(`  ${row.state}: ${row.cities} cities (+${row.newCities})`);
}

if (dryRun) {
  console.log('\nDry run — files not modified.\n');
  process.exit(0);
}

citiesFileSchema.parse(finalCities);
writeFileSync(citiesPath, `${JSON.stringify(finalCities, null, 2)}\n`, 'utf8');
writeFileSync(localitiesPath, `${JSON.stringify(localityFile, null, 2)}\n`, 'utf8');
console.log(`\nWrote ${citiesPath}`);
console.log(`Wrote ${localitiesPath}\n`);
console.log('Next: npx tsx scripts/seed-city-localities.ts\n');
