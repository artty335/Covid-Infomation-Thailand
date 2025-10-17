'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoCentroid } from 'd3-geo';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Paper,
  Tooltip
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

const geoUrl = "https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json";

export default function CovidDeathsMap() {
  // State สำหรับข้อมูล APIi
  const [data, setData] = useState({});
  const [updateDate, setUpdateDate] = useState("");
  const [maxDeaths, setMaxDeaths] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับควบคุมการซูมและจังหวัดที่เลือก
  const [position, setPosition] = useState({ coordinates: [100.5, 13.75], zoom: 15 });
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/covid-deaths');
        const json = await res.json();
        if (json.error) {
          throw new Error(json.error);
        }
        if (!json.deathsByProvince || !json.update_date) {
          throw new Error("Invalid data structure: Missing deathsByProvince or update_date");
        }
        setData(json.deathsByProvince);
        setUpdateDate(json.update_date);
        setMaxDeaths(Math.max(...Object.values(json.deathsByProvince), 1));
      } catch (err) {
        setError(err.message);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // กำหนดสีจากจำนวนผู้เสียชีวิต
  const colorScale = scaleLinear()
    .domain([0, maxDeaths])
    .range(['#ffcccc', '#ff0000']);

  // เมื่อคลิกที่จังหวัด
  const handleProvinceClick = (geo, deaths) => {
    const centroid = geoCentroid(geo);
    setPosition({ coordinates: centroid, zoom: 4 });
    setSelectedProvince({ name: geo.properties.name, deaths });
  };

  // รีเซ็ตกลับไปที่มุมมองเริ่มต้นs
  const handleReset = () => {
    setPosition({ coordinates: [100.5, 13.75], zoom: 15 });
    setSelectedProvince(null);
  };

  // ฟังก์ชันซูมเข้า/ออก
  const handleZoomIn = () => {
    setPosition(prev => ({ ...prev, zoom: prev.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    setPosition(prev => ({ ...prev, zoom: prev.zoom / 1.5 }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        แผนที่จำนวนผู้เสียชีวิตจาก COVID-19
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
            อัปเดตข้อมูลล่าสุด: {updateDate || "ไม่พบข้อมูล"}
          </Typography>

          <Paper
            elevation={3}
            sx={{
              position: 'relative',
              maxWidth: 800,
              margin: '0 auto',
              p: 2,
              borderRadius: 2,
              bgcolor: '#fdf'
            }}
          >
            {/* ปุ่มควบคุมซูม */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                boxShadow: 1,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Tooltip title="ซูมเข้า" placement="left">
                <IconButton onClick={handleZoomIn} aria-label="Zoom In">
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="ซูมออก" placement="left">
                <IconButton onClick={handleZoomOut} aria-label="Zoom Out">
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              {selectedProvince && (
                <Tooltip title="รีเซ็ต" placement="left">
                  <IconButton onClick={handleReset} aria-label="Reset">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <ComposableMap projection="geoMercator">
              <ZoomableGroup center={position.coordinates} zoom={position.zoom}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const provinceName = geo.properties.name;
                      const deaths = data[provinceName] || 0;
                      return (
                        <Tooltip key={geo.rsmKey} title={`${provinceName}: ${deaths} ราย`} arrow>
                          <Geography
                            geography={geo}
                            fill={colorScale(deaths)}
                            stroke="#ffcf"
                            strokeWidth={0.1}
                            onClick={() => handleProvinceClick(geo, deaths)}
                            style={{
                              default: { outline: 'none' },
                              hover: { fill: '#666', outline: 'none', cursor: 'pointer' },
                              pressed: { fill: '#222', outline: 'none' }
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Paper>

          {/* Dialog แสดงรายละเอียดจังหวัด */}
          <Dialog open={Boolean(selectedProvince)} onClose={handleReset} fullWidth maxWidth="sm">
            <DialogTitle>
              รายละเอียดจังหวัด {selectedProvince?.name}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  จำนวนผู้เสียชีวิต: {selectedProvince?.deaths} ราย
                </Typography>
              </Box>
              {/* สามารถเพิ่มข้อมูลเพิ่มเติมหรือคำอธิบายเกี่ยวกับสถานการณ์ได้ที่นี่ */}
              <Typography variant="body1">
                ข้อมูลเพิ่มเติมเกี่ยวกับสถานการณ์และมาตรการป้องกันสามารถแสดงที่นี่
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReset} color="primary">
                กลับสู่แผนที่
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar แจ้ง Error */}
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
