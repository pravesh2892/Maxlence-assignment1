import axios from "axios";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import styles from "./styles.module.css";
import logo from "../../images/logo1.png";
import { HiMiniUserCircle } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";

import { Button, Form as ReactForm } from "react-bootstrap";

const API_URL = "https://api.unsplash.com/search/photos";
const API_URL_key = "eiDtxHn17pKoHmf7n1oipoFNfcJDwwg5IeXI8vfjQJo";
const IMAGES_PER_PAGE = 10;

const Main = () => {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("email");
  const userName = localStorage.getItem("name");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  useEffect(() => {
    const userFromLocalStorage = localStorage.getItem("user");
    if (userFromLocalStorage) {
      setUser(JSON.parse(userFromLocalStorage));
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg("");
        setLoading(true);
        const { data } = await axios.get(
          `${API_URL}?query=${searchInput.current.value}&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=${API_URL_key}`
        );
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("Error fetching images. Try again later.");
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setImages([]);
    fetchImages();
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    setPage(1);
    setImages([]);
    fetchImages();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    window.location.reload();
  };
  const DropdownMenu = () => {
    return (
      <div className={styles.dropdownMenu}>
        <button
          onClick={() => {
            navigate("/profile");
          }}
          className={styles.white_btn}
        >
          My Profile
        </button>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  };
  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <img className={styles.logo} src={logo} alt="logo" />
        {userEmail === "pravesh.meena2892@gmail.com" && userEmail && (
          <button
            className={styles.nav_menu}
            onClick={() => {
              navigate("/user");
            }}
          >
            Registered user
          </button>
        )}

        <div className={styles.search_section}>
          <Form onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="🔍 search photos..."
              className={styles.search_input}
              ref={searchInput}
            />
          </Form>
        </div>
        <div className={styles.user_contanier}>
          <HiMiniUserCircle className={styles.svg_user} />
          <h1>{userName}</h1>
          <BsThreeDotsVertical
            className={styles.svg_drop}
            onClick={toggleDropdown}
          />
          {dropdownVisible && <DropdownMenu />}
        </div>
      </nav>
      <div className={styles.container}>
        {errorMsg && <p className={styles.error_msg}>{errorMsg}</p>}

        <div className={styles.filters}>
          <div onClick={() => handleSelection("nature")}>Nature</div>
          <div onClick={() => handleSelection("birds")}>Birds</div>
          <div onClick={() => handleSelection("cats")}>Cats</div>
          <div onClick={() => handleSelection("shoes")}>Shoes</div>
        </div>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <>
            <div className={styles.images}>
              {images.map((image) => (
                <img
                  key={image.id}
                  src={image.urls.small}
                  alt={image.alt_description}
                  className={styles.image}
                />
              ))}
            </div>
            <div className={styles.buttons}>
              {page > 1 && (
                <Button
                  className={styles.next_btn}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
              )}
              {page < totalPages && (
                <Button
                  className={styles.next_btn}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
