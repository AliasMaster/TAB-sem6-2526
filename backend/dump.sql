--
-- PostgreSQL database dump
--

\restrict KFw5RqQLKvOXchfCSmVjbWXjEPMnP0Uk7eocBJS5WjGUNhvVgyPCtkGobAVhhBc

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: catalog; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA catalog;


ALTER SCHEMA catalog OWNER TO postgres;

--
-- Name: community; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA community;


ALTER SCHEMA community OWNER TO postgres;

--
-- Name: enrollment; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA enrollment;


ALTER SCHEMA enrollment OWNER TO postgres;

--
-- Name: orders; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA orders;


ALTER SCHEMA orders OWNER TO postgres;

--
-- Name: course_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.course_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.course_status OWNER TO postgres;

--
-- Name: enrollment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enrollment_status AS ENUM (
    'active',
    'revoked'
);


ALTER TYPE public.enrollment_status OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: thread_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.thread_category AS ENUM (
    'general',
    'feedback',
    'support'
);


ALTER TYPE public.thread_category OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user',
    'company'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.refresh_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(512) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_revoked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth.refresh_tokens OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id uuid NOT NULL,
    login character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: course_accesses; Type: TABLE; Schema: catalog; Owner: postgres
--

CREATE TABLE catalog.course_accesses (
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE catalog.course_accesses OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: catalog; Owner: postgres
--

CREATE TABLE catalog.courses (
    id uuid NOT NULL,
    author_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    status integer NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE catalog.courses OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: catalog; Owner: postgres
--

CREATE TABLE catalog.lessons (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content_url text,
    order_index integer NOT NULL
);


ALTER TABLE catalog.lessons OWNER TO postgres;

--
-- Name: progress; Type: TABLE; Schema: catalog; Owner: postgres
--

CREATE TABLE catalog.progress (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    last_accessed timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE catalog.progress OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: catalog; Owner: postgres
--

CREATE TABLE catalog.reviews (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE catalog.reviews OWNER TO postgres;

--
-- Name: posts; Type: TABLE; Schema: community; Owner: postgres
--

CREATE TABLE community.posts (
    id uuid NOT NULL,
    thread_id uuid NOT NULL,
    content character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author_id uuid NOT NULL
);


ALTER TABLE community.posts OWNER TO postgres;

--
-- Name: threads; Type: TABLE; Schema: community; Owner: postgres
--

CREATE TABLE community.threads (
    id uuid NOT NULL,
    content character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category integer DEFAULT 0
);


ALTER TABLE community.threads OWNER TO postgres;

--
-- Name: enrollments; Type: TABLE; Schema: enrollment; Owner: postgres
--

CREATE TABLE enrollment.enrollments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    status public.enrollment_status DEFAULT 'active'::public.enrollment_status NOT NULL,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE enrollment.enrollments OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: orders; Owner: postgres
--

CREATE TABLE orders.payments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.payment_status NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE orders.payments OWNER TO postgres;

--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.refresh_tokens (id, user_id, token_hash, expires_at, is_revoked, created_at) FROM stdin;
99999999-9999-9999-9999-999999999999	33333333-3333-3333-3333-333333333333	dummy_token_hash_student_1	2026-05-27 11:52:23.812696	f	2026-05-20 11:52:23.812696
99999999-9999-9999-9999-999999999998	22222222-2222-2222-2222-222222222222	dummy_token_hash_company_1	2026-05-27 11:52:23.812696	f	2026-05-20 11:52:23.812696
99999999-9999-9999-9999-999999999997	11111111-1111-1111-1111-111111111111	dummy_token_hash_admin_1	2026-05-27 11:52:23.812696	f	2026-05-20 11:52:23.812696
fef217a7-1efc-46a4-bddb-1efa4e5a022b	33333333-3333-3333-3333-333333333333	p8ZA5kZTD/VgIFTQHpELk7Qguy6FlkpWPaQQDVnkBYg=	2026-05-27 11:54:51.398756	f	2026-05-20 11:54:51.398778
7a1d6b36-e4bb-406f-a080-73eb457b6799	11111111-1111-1111-1111-111111111111	hVZRrQkxADOS5AOhm44lnT2A+mFQU9UlDW7q7ksFoD4=	2026-05-27 12:06:27.053121	f	2026-05-20 12:06:27.053144
2f31575c-d059-4c80-9b2f-a52eddb3d2e5	11111111-1111-1111-1111-111111111111	FaYCm4rGZdq+VUgat5K8hSlKb69rNn8ZrxpUltkaOyQ=	2026-05-27 12:07:36.287848	f	2026-05-20 12:07:36.287848
d998c960-effb-483e-b1e5-c2c8d7c479a4	22222222-2222-2222-2222-222222222222	UehuVJASKhQE5UZiUWuCx+8dZctW8mz6WUi8S75jtvs=	2026-05-27 12:09:36.746573	f	2026-05-20 12:09:36.746574
7a64358b-b270-474e-aeb7-be74b9af66e5	33333333-3333-3333-3333-333333333333	kGnirNYaK8BZudgK7oieNV86FMXJ77XV+mdOEmqO9j4=	2026-05-27 12:30:08.260921	f	2026-05-20 12:30:08.260922
2497df4a-a845-4b73-bab9-5e1bb518de31	11111111-1111-1111-1111-111111111111	P/1pGO8H+L+oHRsPc7UK1IDjpaY1iSaDXEvUoNi1cbM=	2026-05-27 12:43:26.636158	f	2026-05-20 12:43:26.636159
a51b0ea2-1d88-4329-b164-db5f08cb99c8	22222222-2222-2222-2222-222222222222	knZKLvfgQgpETY3wDnN5KziYXt+VnJF5nHgsUGexU34=	2026-05-27 12:43:42.92625	f	2026-05-20 12:43:42.926251
dbfc1e55-7134-4d44-97f9-8097f1bc1d48	33333333-3333-3333-3333-333333333333	toC2KgJVYEWve00+HVMCQtjrdfSxNCC1rKGZ8HI4dco=	2026-05-27 13:01:20.328655	f	2026-05-20 13:01:20.328655
e58867b3-23c3-4b0d-8978-6bf2b3ea01b1	22222222-2222-2222-2222-222222222222	jXvso8jkCp5PLkwOP0qhR9AE8hkgRStPc4heT2vz3ec=	2026-05-27 13:02:28.055497	f	2026-05-20 13:02:28.055497
2bc941c9-19b9-449f-acf2-2d89bf7cbb97	33333333-3333-3333-3333-333333333333	y4g5eNEh3Biu63Q8vIOzOjPi4lO3g6ogCp5wNChc8Sk=	2026-05-27 13:12:44.604791	f	2026-05-20 13:12:44.604793
8f7c73b0-2938-409e-9ce0-6f7e4b412196	22222222-2222-2222-2222-222222222222	6CLl0106YYda3gVeilVBfs3agqWPox2PvtOIhVif2RE=	2026-05-27 13:13:01.808287	f	2026-05-20 13:13:01.808288
0bd4d62c-b82c-4573-be77-9569d3dd8337	33333333-3333-3333-3333-333333333333	MAXJTUhY+Ek0a7qWiGUpefv8kV222Vo4tOMvASKNHB4=	2026-05-27 13:16:45.344091	f	2026-05-20 13:16:45.344091
7f198090-10e5-4605-a9ff-531092bef29a	11111111-1111-1111-1111-111111111111	Cg0pK3E3hVXVAqaazQgZ41SWMPwXyO3bcsjxbEkgRtU=	2026-05-27 13:25:49.403458	f	2026-05-20 13:25:49.403458
c2b3f3dd-aea1-4071-850a-32746601dd2e	22222222-2222-2222-2222-222222222222	PfiFNGDPWVfi7to++ywLzQxhli7WoI9RKgKdcEWzCps=	2026-05-27 13:26:04.585176	f	2026-05-20 13:26:04.585176
b75247c5-4c23-49f8-880b-7ea75e9fcf5d	33333333-3333-3333-3333-333333333333	a3nHjsnSD7VBqetESNv6nA1LN4rjj12K/sVWenl/FeE=	2026-05-27 13:30:49.386778	f	2026-05-20 13:30:49.386778
2eb5969b-ab77-4956-bf56-48cf52043181	22222222-2222-2222-2222-222222222222	Xb7ygkfOAQa+vPVXAUcF8nH5H0/Ohgur4A81PnwBzzk=	2026-05-27 13:34:46.603345	f	2026-05-20 13:34:46.603346
ee6fe5e4-6522-4b4a-8c38-9c788087a621	33333333-3333-3333-3333-333333333333	IemE4ivh0pOKI3xsRdncjfydCXkd0tWkkIqNPeC9Bn0=	2026-05-27 13:42:32.886456	f	2026-05-20 13:42:32.886457
ebc6f8df-bd06-42d1-80b7-45c23a1e6279	22222222-2222-2222-2222-222222222222	R7F6iav7FpotYnHc1eTT/8i2XZeUVQFIF5G8XqSDPeU=	2026-05-27 13:43:25.191082	f	2026-05-20 13:43:25.191083
d2612967-b424-4403-93c4-8742712bc66a	11111111-1111-1111-1111-111111111111	w4gwrKawmLBWfA1z7EegMIC5j7fF4KeiyMQBcHohTss=	2026-05-27 13:44:00.119947	f	2026-05-20 13:44:00.119948
db4c0ab1-325e-41bc-8e73-2c2f6280e608	33333333-3333-3333-3333-333333333333	wnjrobku3+1tEZGGthsDijLh68gRS+QYl8z8TjuPBT8=	2026-05-27 13:47:03.21744	f	2026-05-20 13:47:03.217441
79613826-fd3f-4d55-a019-fb5ba6bbca41	33333333-3333-3333-3333-333333333333	5vMnGnmDvqe0Q1M8oFNbu9YEsFQbpuxR5MF0idGIEeM=	2026-05-27 13:53:53.293306	f	2026-05-20 13:53:53.293307
de0b9694-d854-44cd-8b9e-e49f89c13dee	22222222-2222-2222-2222-222222222222	rSXpwcr9SsYPrw4ReoYK4T3J1cSCDSlSoK3YU3LTxVc=	2026-05-27 13:54:33.559615	f	2026-05-20 13:54:33.559616
ac3a1cca-c963-49cf-a8f8-8236dc2890ba	33333333-3333-3333-3333-333333333333	aZKwdR4VNAGUHdWR6SzP8fwcP41M177da3Uj/4RNQ/U=	2026-05-27 13:57:59.511709	f	2026-05-20 13:57:59.51171
4fffb404-99d6-4dc0-9314-aa9548684014	22222222-2222-2222-2222-222222222222	mu0/NR9Jk9yBVQM/Uz8D3F+XmILomV/gIJX40FHoLR4=	2026-05-27 14:03:44.03306	f	2026-05-20 14:03:44.033061
76ff9b7b-1524-48d4-a559-2c9b4c7651c3	33333333-3333-3333-3333-333333333333	j1sUosJHsyFK7KdEtRL1LpHN0Jxgb4dDlg8Lp4hFtj8=	2026-05-27 14:12:55.447933	f	2026-05-20 14:12:55.447934
0be94617-7a18-4a37-825a-14853cbb321b	22222222-2222-2222-2222-222222222222	0A5uNcKqzvpvjqG6IK3hVWc+eIgw2ts6TBUTlsCLKUw=	2026-05-27 14:13:55.085579	f	2026-05-20 14:13:55.085581
8deae1f2-ed86-496c-b07e-6b3624925aea	33333333-3333-3333-3333-333333333333	L92ZCsmdmGofDyPRqzoWwNpFeUtd4WhwGznDaOyi5bs=	2026-05-27 14:18:51.190195	f	2026-05-20 14:18:51.190196
21b0ee4b-e350-4776-8e78-171ce959c98c	33333333-3333-3333-3333-333333333333	ZQyg1vIrFm3qHp5t1Xh9BSpsXtaOyCH/1sGZM5Ht9vg=	2026-05-27 14:26:13.602425	f	2026-05-20 14:26:13.602427
00fa40d7-a75f-4f2c-afc8-f32ee5dff2fd	22222222-2222-2222-2222-222222222222	qnHtSds8D3CZOiJFBpeoIF1bu5uX1Qlv35HVrMQIo9c=	2026-05-27 14:30:22.547858	f	2026-05-20 14:30:22.547882
76482c5b-4254-4df7-af9b-e4dc8006ee52	22222222-2222-2222-2222-222222222222	AVZy7BuJ/LshcVqpb/X+5IhMbFAu/HNtBkeYpPuQhLE=	2026-05-27 14:46:26.103436	f	2026-05-20 14:46:26.103436
72d93889-043e-4614-8f34-40dc1b3b7548	33333333-3333-3333-3333-333333333333	f9JDDs0heCz4xhU4EtJ1bPpDr1GuL8fODLocru4+QvE=	2026-05-27 14:46:58.976911	f	2026-05-20 14:46:58.976911
fc2017be-fb7c-4404-bff7-732f7a112d53	11111111-1111-1111-1111-111111111111	m3HqmxsYsLX0XxTCnD1u7AlqYWeZP3M86314iYBrB2w=	2026-05-27 15:00:47.589099	f	2026-05-20 15:00:47.5891
ce3cc38c-b71c-4ad4-884f-d8aa41fc51d2	33333333-3333-3333-3333-333333333333	DmpznwFB/RmsAAZkyVpOCgakW2ebkb5jIEk1SmAn5GE=	2026-05-27 15:03:14.614063	f	2026-05-20 15:03:14.614063
dfd7ca58-8da7-4b0a-b64a-c65bfdee6791	11111111-1111-1111-1111-111111111111	6MaSzIyBrvBgwhgKkG6yv09Xb07dfWpSeJ16KXHuWPY=	2026-05-27 15:10:35.668434	f	2026-05-20 15:10:35.668435
2aacf685-f602-4396-9e2f-705d5b4add7d	11111111-1111-1111-1111-111111111111	tnDnDonWnoCMveOU+NEoRtKtXGG42nBfT0TcVt5qvDE=	2026-05-27 15:24:44.296017	f	2026-05-20 15:24:44.296018
f9baeca1-5ea2-40e3-8e0a-756485906f28	33333333-3333-3333-3333-333333333333	5Ha2IHVcwAqVRL3OR9mxj3+oAuVa1ZHIe1xL8hv7udQ=	2026-05-27 15:25:26.986578	f	2026-05-20 15:25:26.986578
cbd6c5e5-2131-4327-9e21-a10431972a65	11111111-1111-1111-1111-111111111111	Yl6nBlCDkrmZVLQwrnEzcXmDx3RWAvEQAkHZjmfW7+w=	2026-05-27 15:29:55.179292	f	2026-05-20 15:29:55.179293
6a1cec0f-70ad-40cd-861f-f6e3568f4614	33333333-3333-3333-3333-333333333333	UVkQWQX4owBT6p/scsImffiI0E9fT2r/utoQiDW6kQ4=	2026-05-27 15:30:35.239824	f	2026-05-20 15:30:35.239825
4f455a21-dec8-4d80-8c46-18724efb4f44	22222222-2222-2222-2222-222222222222	iKBZ3V6sOFjeUNkuczYA/0jTsd0P3RZ7iXHa0VL4u4w=	2026-05-27 15:31:07.634598	f	2026-05-20 15:31:07.634598
97c30b7b-be76-4d28-9174-0004973471a5	22222222-2222-2222-2222-222222222222	EEwqUyNrOLpGsA7vw9wXFdekDgutGU/fuvSJfVGUSL4=	2026-05-27 23:26:13.892476	f	2026-05-20 23:26:13.892501
3003f5f8-262c-4c07-9210-65dcda7d731f	22222222-2222-2222-2222-222222222222	gUCvrdnQipy38n6IBmXH0O+36OTVeKm/2A3Kx43T3cI=	2026-05-27 23:43:21.490325	f	2026-05-20 23:43:21.490325
adf455e9-7dcf-4ea0-9ce7-557bc2d575cb	22222222-2222-2222-2222-222222222222	9Zh4E1P3ATFSfSVbmEs2/EMU7dP41cnZYdjVbdfZkGc=	2026-05-27 23:43:36.121446	f	2026-05-20 23:43:36.121446
3f60c519-c753-4f37-aedf-4cee51e36a95	22222222-2222-2222-2222-222222222222	hYxBvP9cyqNJIRVa8wEWm564HZSTgxPSwplYchwSsFE=	2026-05-27 23:48:11.876809	f	2026-05-20 23:48:11.87681
2987ecfe-1511-4b1b-aa3c-efd42f836ec8	22222222-2222-2222-2222-222222222222	jG7jdGoye5N3kuf9ChClYFPQyzAqQydrHnTTrvPqVtU=	2026-05-27 23:48:25.670029	f	2026-05-20 23:48:25.670029
63fc847f-9cda-44da-a696-125f0c0fdab1	22222222-2222-2222-2222-222222222222	H1tTAM0rZhi8rFiEzvXP6FlYXXUEPVePSCdqraAivgE=	2026-05-27 23:50:30.129534	f	2026-05-20 23:50:30.129534
3c04ad8a-1590-4f48-921e-a723f92c57fa	22222222-2222-2222-2222-222222222222	LNlICDoWQDmGahW8RvQwpzWXm2WQBlBumEBNX1zUSDM=	2026-05-27 23:51:49.263449	f	2026-05-20 23:51:49.263449
71fc458d-7de5-4a3d-8108-14b366a983d7	22222222-2222-2222-2222-222222222222	sQ9/lPm5wt4cjZOCdLgbKJ2m1XyTgPb8BKK+6kE14X8=	2026-05-28 06:03:14.661978	f	2026-05-21 06:03:14.66201
f6d74f20-19a0-4c2a-b6e2-bd66e1c81d80	33333333-3333-3333-3333-333333333333	1WJiJiuxTFBi62znvYlFx/eXIjAqTXIGznQ3ToCKrhU=	2026-05-28 06:03:42.01222	f	2026-05-21 06:03:42.01222
5682b22d-7c81-4ae7-9c1e-8c5bbcaba19d	22222222-2222-2222-2222-222222222222	5Qr8geBASzOVNVF7s6xExWbnE0eDg9usXZmQbeLbzAM=	2026-05-28 06:04:38.370015	f	2026-05-21 06:04:38.370015
0e940fc0-7cc0-4573-ba4d-c82ab5bca2ab	33333333-3333-3333-3333-333333333333	wC4ViSWcLzaDrkAVyi32cJGU1FOifdGlo0wAerWE4YA=	2026-05-28 06:14:47.307007	f	2026-05-21 06:14:47.307007
741576ea-7319-41cf-9cda-01c7078b6a3a	11111111-1111-1111-1111-111111111111	hzcCtYNaWRqWD4DLhxhn/OBEpqGEAWSNofmmRQ5oaYc=	2026-05-28 06:15:30.693521	f	2026-05-21 06:15:30.693522
72f66b75-facd-4c27-b1b3-f873400a3228	33333333-3333-3333-3333-333333333333	56GrVRP+0sZUYXNjbcowV77+IwTr9Beu7sXms8eMTSY=	2026-05-28 06:29:55.32774	f	2026-05-21 06:29:55.32774
b895700b-cc17-4b5a-a930-f77636de611e	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	4/jUVe6Nq2QdwJCPFcUe/2uPLekc8hs3jmLeDgBVmVM=	2026-05-28 06:32:26.037588	f	2026-05-21 06:32:26.037588
e035894f-aa33-47ff-b4d8-0ad5c174ff60	11111111-1111-1111-1111-111111111111	W0CF8tmMcWSGJFmY5qsrPmbYtVxWbL7CJM7eh1s/M8g=	2026-05-28 06:33:19.768483	f	2026-05-21 06:33:19.768483
2c03dc39-a599-4a35-8d33-d45fd1323dcb	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	5LWcIB/k7b94+dA2KPtL5TJWGRRDYsQiYBFx4HvJwV4=	2026-05-28 06:34:15.739713	f	2026-05-21 06:34:15.739714
7dd742f1-398d-4d6f-9166-a4ff54d6cee3	11111111-1111-1111-1111-111111111111	V0f7zWHrlzXPSz8+JcK/+49MqSKRlLnkjMKqjeIoS08=	2026-05-28 06:34:30.256558	f	2026-05-21 06:34:30.256559
36694a2d-6f59-4d85-b18c-41cd1a30b96d	22222222-2222-2222-2222-222222222222	SF1RvA5mEnpSy7kw3FZkOu8xRKQLcIVNvUetUNxv29c=	2026-05-28 06:36:08.34573	f	2026-05-21 06:36:08.345731
dce665d4-732b-4f4a-aec8-edbca872bda5	22222222-2222-2222-2222-222222222222	nGVgl2oAvmAlP4xWp4GH4Lz0JbK9HVF3Lw+/pxuE6Xc=	2026-05-28 06:39:16.480512	f	2026-05-21 06:39:16.480513
546b9c6f-26d9-4a6e-8d98-e362a630b51b	11111111-1111-1111-1111-111111111111	GlvszKapzsCtmPqbyBFht0mpsH/mDzIziWQW1xOlHJ0=	2026-05-28 06:39:25.499054	f	2026-05-21 06:39:25.499055
c46bfd9b-faad-470b-9b2e-0a0f0733ec4e	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	qH0/xGf819HOpAWJa5Lh4JGyyqrI7TNgrnR/mPAbT50=	2026-05-28 06:39:47.764069	f	2026-05-21 06:39:47.76407
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (id, login, password_hash, role) FROM stdin;
11111111-1111-1111-1111-111111111111	admin	$2a$11$uroIZtECDzGg3fe24LCLxebVOZbqvEhP0pd7YFzcs6Ernthc3mIDK	admin
22222222-2222-2222-2222-222222222222	company	$2a$11$6Z501vaz5w57TIOWiBiz6e3LCme/wVPqViAEqE2pdSoBJZvq4G9sC	company
33333333-3333-3333-3333-333333333333	student	$2a$11$DqyT3NRfWD5XcFVWNm1QzeSB/TAzmGEesBEW.MpP7owVoo2By1ucW	user
d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	student2	$2a$11$cofiwwXt89NTweH7eouWmeC7l/flm4aviDYZVQSCC25ubL4gR28uu	user
\.


--
-- Data for Name: course_accesses; Type: TABLE DATA; Schema: catalog; Owner: postgres
--

COPY catalog.course_accesses (user_id, course_id, granted_at) FROM stdin;
33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444444	2026-05-20 11:52:23.81762
33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444445	2026-05-20 11:52:23.81762
33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444446	2026-05-20 11:52:23.81762
33333333-3333-3333-3333-333333333333	fad5123e-1652-43d6-b24a-5f033b1dbb79	2026-05-20 14:52:00.883167
d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	44444444-4444-4444-4444-444444444445	2026-05-21 06:32:35.803281
d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	fad5123e-1652-43d6-b24a-5f033b1dbb79	2026-05-21 06:32:51.287439
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: catalog; Owner: postgres
--

COPY catalog.courses (id, author_id, title, description, price, image_url, status, is_blocked, created_at) FROM stdin;
44444444-4444-4444-4444-444444444446	22222222-2222-2222-2222-222222222222	Wzorce Projektowe	Wzorce kreacyjne, strukturalne	199.00	https://picsum.photos/seed/patterns/800/600	0	f	2026-05-20 11:52:23.816578
44444444-4444-4444-4444-444444444445	22222222-2222-2222-2222-222222222222	Zaawansowany C#	Delegaty, eventy, LINQ	149.00	https://picsum.photos/seed/csharp2/800/600	0	f	2026-05-20 11:52:23.816578
fad5123e-1652-43d6-b24a-5f033b1dbb79	22222222-2222-2222-2222-222222222222	dsdasasd	dsaadsdas	4.00	dasasdasd	0	f	2026-05-20 13:54:50.441341
104cc841-f2f0-43b0-9e97-bf965d575fc9	22222222-2222-2222-2222-222222222222	gg	gg	2.00	g	1	f	2026-05-20 23:30:47.140467
44444444-4444-4444-4444-444444444444	22222222-2222-2222-2222-222222222222	Podstawy programowania w C#	Praktyczny kurs programowania w języku C# od podstaw	99.00	https://picsum.photos/seed/csharp/800/600	1	f	2026-05-20 11:52:23.816578
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: catalog; Owner: postgres
--

COPY catalog.lessons (id, course_id, title, content_url, order_index) FROM stdin;
77777777-7777-7777-7777-777777777777	44444444-4444-4444-4444-444444444444	Instalacja środowiska	setup.mp4	2
66666666-6666-6666-6666-666666666667	44444444-4444-4444-4444-444444444445	Czym są delegaty?	delegates.mp4	1
66666666-6666-6666-6666-666666666668	44444444-4444-4444-4444-444444444446	Wzorzec Singleton	singleton.mp4	1
66666666-6666-6666-6666-666666666666	44444444-4444-4444-4444-444444444444	Wprowadzenie do kursu	c0b102f7-700b-41cf-af36-5d5bc51a6c77/index.m3u8	1
2747fbfd-06cf-4add-855a-993013848df7	fad5123e-1652-43d6-b24a-5f033b1dbb79	[Text] BB	**Siema**\n	1
46f048d3-b14b-4d2b-8480-f038263f1edf	fad5123e-1652-43d6-b24a-5f033b1dbb79	[Video] Kocham gotować	de5f742e-b228-4f98-957a-4c65024c3ace/index.m3u8	3
6fe1b953-09ce-48f8-b8cc-767a942784fd	fad5123e-1652-43d6-b24a-5f033b1dbb79	[Document] 432	a4409c47-792f-4b6a-b785-03ee51ee9ce1/a4409c47-792f-4b6a-b785-03ee51ee9ce1.pdf	2
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: catalog; Owner: postgres
--

COPY catalog.progress (id, user_id, lesson_id, is_completed, last_accessed) FROM stdin;
cccccccc-cccc-cccc-cccc-ccccccccccc1	33333333-3333-3333-3333-333333333333	77777777-7777-7777-7777-777777777777	t	2026-05-20 13:01:32.461359
cccccccc-cccc-cccc-cccc-cccccccccccc	33333333-3333-3333-3333-333333333333	66666666-6666-6666-6666-666666666666	t	2026-05-20 13:01:33.716294
cccccccc-cccc-cccc-cccc-ccccccccccc2	33333333-3333-3333-3333-333333333333	66666666-6666-6666-6666-666666666667	t	2026-05-20 13:02:13.028476
9be6339d-5e59-452e-8bcb-52267d744d5a	33333333-3333-3333-3333-333333333333	46f048d3-b14b-4d2b-8480-f038263f1edf	t	2026-05-20 15:00:03.433821
3bd0ffc2-5fd4-480b-a376-8e8c16f3cf9d	33333333-3333-3333-3333-333333333333	2747fbfd-06cf-4add-855a-993013848df7	t	2026-05-20 15:00:05.056201
c8ffbe6b-38d9-4d67-8d82-49f4debbc435	33333333-3333-3333-3333-333333333333	6fe1b953-09ce-48f8-b8cc-767a942784fd	t	2026-05-20 15:00:07.283065
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: catalog; Owner: postgres
--

COPY catalog.reviews (id, user_id, course_id, rating, comment, created_at) FROM stdin;
dddddddd-dddd-dddd-dddd-dddddddddddd	33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444444	5	Świetny kurs dla początkujących!	2026-05-20 11:52:23.820616
dddddddd-dddd-dddd-dddd-ddddddddddd1	33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444445	4	Trudny, ale warto	2026-05-20 11:52:23.820616
dddddddd-dddd-dddd-dddd-ddddddddddd2	33333333-3333-3333-3333-333333333333	44444444-4444-4444-4444-444444444446	5	Wzorce fajnie wytłumaczone	2026-05-20 11:52:23.820616
c6313cef-a2d0-4ad7-8c5f-24aaa09c9b95	33333333-3333-3333-3333-333333333333	fad5123e-1652-43d6-b24a-5f033b1dbb79	3		2026-05-20 15:00:09.7058
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: community; Owner: postgres
--

COPY community.posts (id, thread_id, content, created_at, author_id) FROM stdin;
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Zdecydowanie Visual Studio lub Rider!	2026-05-20 11:52:23.815274	22222222-2222-2222-2222-222222222222
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Dzięki za polecenie!	2026-05-20 11:52:23.815274	33333333-3333-3333-3333-333333333333
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1	Pokaż logi błędu, spróbujemy pomóc.	2026-05-20 11:52:23.815274	22222222-2222-2222-2222-222222222222
374a5655-d36f-4042-bc9d-897096e75a2f	da1adce1-bb57-47b2-afc9-f1e749c67149	Halo	2026-05-20 23:26:33.870092	22222222-2222-2222-2222-222222222222
2a54dee5-b1eb-4ee0-b199-c4ba213f49be	da1adce1-bb57-47b2-afc9-f1e749c67149	Czesc	2026-05-21 06:34:23.257946	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0
\.


--
-- Data for Name: threads; Type: TABLE DATA; Schema: community; Owner: postgres
--

COPY community.threads (id, content, title, author_id, created_at, category) FROM stdin;
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	Jakie IDE polecacie do C#?	Pierwsze kroki	33333333-3333-3333-3333-333333333333	2026-05-20 11:52:23.814213	0
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1	Problem z kompilacją	Pomoc z kodem	33333333-3333-3333-3333-333333333333	2026-05-20 11:52:23.814213	0
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2	Prośba o nowy kurs z Pythona	Sugestia kursu	33333333-3333-3333-3333-333333333333	2026-05-20 11:52:23.814213	0
da1adce1-bb57-47b2-afc9-f1e749c67149	Cos tam	Cos tam	22222222-2222-2222-2222-222222222222	2026-05-20 23:26:26.961206	2
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: enrollment; Owner: postgres
--

COPY enrollment.enrollments (id, user_id, course_id, status, enrolled_at) FROM stdin;
2fe1d65a-7f0e-486a-b87d-977731c27b7b	33333333-3333-3333-3333-333333333333	fad5123e-1652-43d6-b24a-5f033b1dbb79	active	2026-05-20 14:52:00.930694
a0404805-e5da-456a-a9c4-ce5cc17083e7	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	44444444-4444-4444-4444-444444444445	active	2026-05-21 06:32:35.812561
8920ac0b-2a84-49a1-842d-c09d56d006d5	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	fad5123e-1652-43d6-b24a-5f033b1dbb79	active	2026-05-21 06:32:51.28801
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: orders; Owner: postgres
--

COPY orders.payments (id, user_id, course_id, amount, status, created_at) FROM stdin;
2d11934c-2fd8-4696-b82c-b58a9c550610	33333333-3333-3333-3333-333333333333	fad5123e-1652-43d6-b24a-5f033b1dbb79	0.00	pending	2026-05-20 14:48:20.499368
e4b6c3b9-ddd0-4ef9-a7d7-bd8412592830	33333333-3333-3333-3333-333333333333	fad5123e-1652-43d6-b24a-5f033b1dbb79	4.00	completed	2026-05-20 14:52:00.687439
77ef1671-db7d-41b0-8eba-e6d2b0b5254e	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	44444444-4444-4444-4444-444444444445	149.00	completed	2026-05-21 06:32:35.551472
66ee5ac1-7416-4b1a-951a-4ec58f54849f	d1ae305b-1cc4-41ea-9dbf-d7c7c3499db0	fad5123e-1652-43d6-b24a-5f033b1dbb79	4.00	completed	2026-05-21 06:32:51.263587
\.


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: course_accesses course_accesses_pkey; Type: CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.course_accesses
    ADD CONSTRAINT course_accesses_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: community; Owner: postgres
--

ALTER TABLE ONLY community.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: community; Owner: postgres
--

ALTER TABLE ONLY community.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: enrollment; Owner: postgres
--

ALTER TABLE ONLY enrollment.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_user_id_course_id_key; Type: CONSTRAINT; Schema: enrollment; Owner: postgres
--

ALTER TABLE ONLY enrollment.enrollments
    ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: orders; Owner: postgres
--

ALTER TABLE ONLY orders.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: course_accesses course_accesses_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.course_accesses
    ADD CONSTRAINT course_accesses_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id);


--
-- Name: course_accesses course_accesses_user_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.course_accesses
    ADD CONSTRAINT course_accesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: courses courses_author_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.courses
    ADD CONSTRAINT courses_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id);


--
-- Name: progress progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.progress
    ADD CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES catalog.lessons(id);


--
-- Name: progress progress_user_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.progress
    ADD CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: reviews reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.reviews
    ADD CONSTRAINT reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id);


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: catalog; Owner: postgres
--

ALTER TABLE ONLY catalog.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: community; Owner: postgres
--

ALTER TABLE ONLY community.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);


--
-- Name: posts posts_thread_id_fkey; Type: FK CONSTRAINT; Schema: community; Owner: postgres
--

ALTER TABLE ONLY community.posts
    ADD CONSTRAINT posts_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES community.threads(id);


--
-- Name: threads threads_author_id_fkey; Type: FK CONSTRAINT; Schema: community; Owner: postgres
--

ALTER TABLE ONLY community.threads
    ADD CONSTRAINT threads_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: enrollment; Owner: postgres
--

ALTER TABLE ONLY enrollment.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id);


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: enrollment; Owner: postgres
--

ALTER TABLE ONLY enrollment.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: payments payments_course_id_fkey; Type: FK CONSTRAINT; Schema: orders; Owner: postgres
--

ALTER TABLE ONLY orders.payments
    ADD CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES catalog.courses(id);


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: orders; Owner: postgres
--

ALTER TABLE ONLY orders.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA auth TO auth_user;
GRANT USAGE ON SCHEMA auth TO community_user;
GRANT USAGE ON SCHEMA auth TO catalog_user;
GRANT USAGE ON SCHEMA auth TO orders_user;
GRANT USAGE ON SCHEMA auth TO report_user;


--
-- Name: SCHEMA catalog; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA catalog TO catalog_user;
GRANT USAGE ON SCHEMA catalog TO orders_user;
GRANT USAGE ON SCHEMA catalog TO report_user;
GRANT USAGE ON SCHEMA catalog TO enrollment_user;


--
-- Name: SCHEMA community; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA community TO community_user;
GRANT USAGE ON SCHEMA community TO report_user;


--
-- Name: SCHEMA enrollment; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA enrollment TO enrollment_user;
GRANT USAGE ON SCHEMA enrollment TO report_user;
GRANT USAGE ON SCHEMA enrollment TO catalog_user;


--
-- Name: SCHEMA orders; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA orders TO orders_user;
GRANT USAGE ON SCHEMA orders TO report_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: postgres
--

GRANT ALL ON TABLE auth.refresh_tokens TO auth_user;
GRANT SELECT ON TABLE auth.refresh_tokens TO community_user;
GRANT SELECT ON TABLE auth.refresh_tokens TO catalog_user;
GRANT SELECT ON TABLE auth.refresh_tokens TO orders_user;
GRANT SELECT ON TABLE auth.refresh_tokens TO report_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: postgres
--

GRANT ALL ON TABLE auth.users TO auth_user;
GRANT SELECT ON TABLE auth.users TO community_user;
GRANT SELECT ON TABLE auth.users TO catalog_user;
GRANT SELECT ON TABLE auth.users TO orders_user;
GRANT SELECT ON TABLE auth.users TO report_user;


--
-- Name: TABLE course_accesses; Type: ACL; Schema: catalog; Owner: postgres
--

GRANT ALL ON TABLE catalog.course_accesses TO catalog_user;
GRANT SELECT ON TABLE catalog.course_accesses TO orders_user;
GRANT SELECT ON TABLE catalog.course_accesses TO report_user;
GRANT SELECT ON TABLE catalog.course_accesses TO enrollment_user;


--
-- Name: TABLE courses; Type: ACL; Schema: catalog; Owner: postgres
--

GRANT ALL ON TABLE catalog.courses TO catalog_user;
GRANT SELECT ON TABLE catalog.courses TO orders_user;
GRANT SELECT ON TABLE catalog.courses TO report_user;
GRANT SELECT ON TABLE catalog.courses TO enrollment_user;


--
-- Name: TABLE lessons; Type: ACL; Schema: catalog; Owner: postgres
--

GRANT ALL ON TABLE catalog.lessons TO catalog_user;
GRANT SELECT ON TABLE catalog.lessons TO orders_user;
GRANT SELECT ON TABLE catalog.lessons TO report_user;
GRANT SELECT ON TABLE catalog.lessons TO enrollment_user;


--
-- Name: TABLE progress; Type: ACL; Schema: catalog; Owner: postgres
--

GRANT ALL ON TABLE catalog.progress TO catalog_user;
GRANT SELECT ON TABLE catalog.progress TO orders_user;
GRANT SELECT ON TABLE catalog.progress TO report_user;
GRANT ALL ON TABLE catalog.progress TO enrollment_user;


--
-- Name: TABLE reviews; Type: ACL; Schema: catalog; Owner: postgres
--

GRANT ALL ON TABLE catalog.reviews TO catalog_user;
GRANT SELECT ON TABLE catalog.reviews TO orders_user;
GRANT SELECT ON TABLE catalog.reviews TO report_user;
GRANT SELECT ON TABLE catalog.reviews TO enrollment_user;


--
-- Name: TABLE posts; Type: ACL; Schema: community; Owner: postgres
--

GRANT ALL ON TABLE community.posts TO community_user;
GRANT SELECT ON TABLE community.posts TO report_user;


--
-- Name: TABLE threads; Type: ACL; Schema: community; Owner: postgres
--

GRANT ALL ON TABLE community.threads TO community_user;
GRANT SELECT ON TABLE community.threads TO report_user;


--
-- Name: TABLE enrollments; Type: ACL; Schema: enrollment; Owner: postgres
--

GRANT ALL ON TABLE enrollment.enrollments TO enrollment_user;
GRANT SELECT ON TABLE enrollment.enrollments TO report_user;
GRANT SELECT ON TABLE enrollment.enrollments TO catalog_user;


--
-- Name: TABLE payments; Type: ACL; Schema: orders; Owner: postgres
--

GRANT ALL ON TABLE orders.payments TO orders_user;
GRANT SELECT ON TABLE orders.payments TO report_user;


--
-- PostgreSQL database dump complete
--

\unrestrict KFw5RqQLKvOXchfCSmVjbWXjEPMnP0Uk7eocBJS5WjGUNhvVgyPCtkGobAVhhBc

