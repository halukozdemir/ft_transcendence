from app.moderation import check_text


class TestTurkishProfanity:
    def test_detects_turkish_profanity(self):
        result = check_text("sen bir orospu cocugusun")
        assert result["flagged"] is True

    def test_detects_amk(self):
        result = check_text("bu ne amk")
        assert result["flagged"] is True

    def test_detects_siktir(self):
        result = check_text("siktir git buradan")
        assert result["flagged"] is True

    def test_detects_salak(self):
        result = check_text("salak misin sen")
        assert result["flagged"] is True

    def test_censors_turkish_word(self):
        result = check_text("sen bir aptal adamsın")
        assert result["flagged"] is True
        assert "aptal" not in result["censored"]


class TestEnglishProfanity:
    def test_detects_english_profanity(self):
        result = check_text("what the fuck is this")
        assert result["flagged"] is True

    def test_detects_shit(self):
        result = check_text("this is bullshit")
        assert result["flagged"] is True

    def test_censors_english_word(self):
        result = check_text("you are an asshole")
        assert result["flagged"] is True
        assert "asshole" not in result["censored"]

    def test_detects_leetspeak(self):
        result = check_text("f*ck you")
        assert result["flagged"] is True


class TestCleanText:
    def test_clean_text_passes(self):
        result = check_text("merhaba nasilsin")
        assert result["flagged"] is False
        assert result["censored"] == "merhaba nasilsin"

    def test_clean_english_passes(self):
        result = check_text("hello how are you")
        assert result["flagged"] is False

    def test_empty_string(self):
        result = check_text("")
        assert result["flagged"] is False

    def test_whitespace_only(self):
        result = check_text("   ")
        assert result["flagged"] is False

    def test_none_text(self):
        result = check_text(None)
        assert result["flagged"] is False

    def test_long_clean_text(self):
        text = "bu bir test mesajidir " * 100
        result = check_text(text)
        assert result["flagged"] is False
