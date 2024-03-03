> library(readr)
> migdata <- read_csv("Desktop/Spring 2024/GEOG456/proj/migdata.csv", 
                      +     col_types = cols(`1990` = col_integer(), 
                                             +         `1995` = col_integer(), `2000` = col_integer(), 
                                             +         `2005` = col_integer(), `2010` = col_integer(), 
                                             +         `2015` = col_integer(), `2020` = col_integer()))

countries_coords_subset = select(countries_codes_and_coordinates, `Numeric code`, `Latitude (average)`, `Longitude (average)`)


merged_data <- migdata %>%
  left_join(countries_coords_subset, by = c("dest_code" = "Numeric code"))


data(countryExData, package="rworldmap")
head(countryExData)

#### geojson version

final_version <- merged_data %>% 
  select(-country_name)

final_v_cleaned <- na.omit(final_v)

library(sf)

final_v_sf <- st_as_sf(final_v_cleaned, coords = c("Longitude (average)", "Latitude (average)"), crs = 4326)
file_path <- "~/Desktop/Spring 2024/GEOG456/proj/final_v.geojson"

# Use st_write to write the GeoJSON file to the specified path
st_write(final_v_sf, file_path, driver = "GeoJSON")
