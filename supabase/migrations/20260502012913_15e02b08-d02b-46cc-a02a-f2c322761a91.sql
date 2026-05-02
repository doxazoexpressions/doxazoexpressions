-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Devotionals
CREATE TABLE public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scripture_reference TEXT,
  scripture_text TEXT,
  body TEXT NOT NULL,
  declaration TEXT,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER devotionals_updated_at BEFORE UPDATE ON public.devotionals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prayers
CREATE TABLE public.prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'Morning Prayer',
  scripture_reference TEXT,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER prayers_updated_at BEFORE UPDATE ON public.prayers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Teachings
CREATE TABLE public.teachings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scripture_reference TEXT,
  excerpt TEXT,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'Teaching',
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER teachings_updated_at BEFORE UPDATE ON public.teachings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Testimonies
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Speaking requests
CREATE TABLE public.speaking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  event_type TEXT,
  event_date DATE,
  topic TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.speaking_requests ENABLE ROW LEVEL SECURITY;

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- Profiles: own only
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles: only admins manage; users can see own
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Devotionals: public read published, admin manage
CREATE POLICY "Anyone reads published devotionals" ON public.devotionals FOR SELECT USING (published = true);
CREATE POLICY "Admins read all devotionals" ON public.devotionals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert devotionals" ON public.devotionals FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update devotionals" ON public.devotionals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete devotionals" ON public.devotionals FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Prayers
CREATE POLICY "Anyone reads published prayers" ON public.prayers FOR SELECT USING (published = true);
CREATE POLICY "Admins read all prayers" ON public.prayers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert prayers" ON public.prayers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update prayers" ON public.prayers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete prayers" ON public.prayers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Teachings
CREATE POLICY "Anyone reads published teachings" ON public.teachings FOR SELECT USING (published = true);
CREATE POLICY "Admins read all teachings" ON public.teachings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert teachings" ON public.teachings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update teachings" ON public.teachings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete teachings" ON public.teachings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Testimonies: anyone submits, public reads approved, admins manage
CREATE POLICY "Anyone reads approved testimonies" ON public.testimonies FOR SELECT USING (approved = true);
CREATE POLICY "Anyone submits testimony" ON public.testimonies FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read all testimonies" ON public.testimonies FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update testimonies" ON public.testimonies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete testimonies" ON public.testimonies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Speaking requests: anyone submits, only admins read
CREATE POLICY "Anyone submits speaking request" ON public.speaking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read speaking requests" ON public.speaking_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete speaking requests" ON public.speaking_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Contact messages: anyone submits, only admins read
CREATE POLICY "Anyone submits contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contact" ON public.contact_messages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));