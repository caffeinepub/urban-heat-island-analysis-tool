import Map "mo:core/Map";
import Text "mo:core/Text";

actor {
  type City = {
    name : Text;
    country : Text;
  };

  type Preferences = {
    city : Text;
    unit : Text; // "C" or "F"
  };

  let preferencesStore = Map.empty<Text, Preferences>();

  let cities : [City] = [
    { name = "New York"; country = "US" },
    { name = "London"; country = "GB" },
    { name = "Tokyo"; country = "JP" },
    { name = "Paris"; country = "FR" },
    { name = "Berlin"; country = "DE" },
    { name = "Sydney"; country = "AU" },
    { name = "Toronto"; country = "CA" },
    { name = "Beijing"; country = "CN" },
    { name = "Moscow"; country = "RU" },
    { name = "Dubai"; country = "AE" },
    { name = "Singapore"; country = "SG" },
    { name = "Hong Kong"; country = "HK" },
    { name = "Madrid"; country = "ES" },
    { name = "Rome"; country = "IT" },
    { name = "Amsterdam"; country = "NL" },
    { name = "Istanbul"; country = "TR" },
    { name = "Bangkok"; country = "TH" },
    { name = "Vienna"; country = "AT" },
    { name = "Los Angeles"; country = "US" },
    { name = "Chicago"; country = "US" },
    { name = "San Francisco"; country = "US" },
    { name = "Miami"; country = "US" },
    { name = "Melbourne"; country = "AU" },
    { name = "Brisbane"; country = "AU" },
    { name = "Sao Paulo"; country = "BR" },
    { name = "Buenos Aires"; country = "AR" },
    { name = "Johannesburg"; country = "ZA" },
    { name = "Cairo"; country = "EG" },
    { name = "Lagos"; country = "NG" },
    { name = "Nairobi"; country = "KE" },
    { name = "Mumbai"; country = "IN" },
    { name = "Delhi"; country = "IN" },
    { name = "Kuala Lumpur"; country = "MY" },
    { name = "Seoul"; country = "KR" },
    { name = "Mexico City"; country = "MX" },
    { name = "Santiago"; country = "CL" },
    { name = "Lisbon"; country = "PT" },
    { name = "Prague"; country = "CZ" },
    { name = "Warsaw"; country = "PL" },
    { name = "Budapest"; country = "HU" },
    { name = "Athens"; country = "GR" },
    { name = "Dublin"; country = "IE" },
    { name = "Zurich"; country = "CH" },
    { name = "Stockholm"; country = "SE" },
    { name = "Oslo"; country = "NO" },
    { name = "Copenhagen"; country = "DK" },
    { name = "Helsinki"; country = "FI" },
    { name = "Brussels"; country = "BE" },
    { name = "Munich"; country = "DE" },
    { name = "Frankfurt"; country = "DE" },
  ];

  public shared ({ caller }) func savePreferences(sessionKey : Text, preferences : Preferences) : async () {
    preferencesStore.add(sessionKey, preferences);
  };

  public query ({ caller }) func getPreferences(sessionKey : Text) : async ?Preferences {
    preferencesStore.get(sessionKey);
  };

  public query ({ caller }) func getCities() : async [City] {
    cities;
  };
};
