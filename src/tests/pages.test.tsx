import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { AnalysisProvider } from '../state/AnalysisContext';
import Profile from '../pages/Profile';
import Meals from '../pages/Meals';
import Results from '../pages/Results';
import { BMICard } from '../components/ui/BMICard';
import { CalorieCard } from '../components/ui/CalorieCard';
import { SafetyBanner } from '../components/ui/SafetyBanner';
import { matchesFoodQuery, FOOD_ALIASES } from '../data/aliases';
import { FOODS } from '../data/foods';

describe('Phase 2 UI & Pages Integration Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Profile Page', () => {
    it('renders all required form fields and privacy notice', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
      expect(screen.getByText(/About You/i)).toBeInTheDocument();
      expect(screen.getByText(/All data stays on your device/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
    });

    it('calculates BMI dynamically and displays Asian Indian category', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      const heightInput = screen.getByLabelText(/height/i);
      const weightInput = screen.getByLabelText(/weight/i);

      fireEvent.change(heightInput, { target: { value: '170' } });
      fireEvent.change(weightInput, { target: { value: '70' } });

      // BMI for 70kg, 170cm = 24.2 kg/m² -> Overweight under Asian cutoffs
      expect(screen.getByText('24.2')).toBeInTheDocument();
      expect(screen.getByText('Overweight')).toBeInTheDocument();
    });

    it('does NOT show adult BMI category for ages 13-17 (safety rule)', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      const ageInput = screen.getByLabelText(/age/i);
      const heightInput = screen.getByLabelText(/height/i);
      const weightInput = screen.getByLabelText(/weight/i);

      fireEvent.change(ageInput, { target: { value: '15' } });
      fireEvent.change(heightInput, { target: { value: '160' } });
      fireEvent.change(weightInput, { target: { value: '55' } });

      // Should show adolescent disclaimer rather than adult category
      expect(screen.getByText(/Adolescent \(13–17y\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Adult BMI categories do not apply to ages 13–17/i)).toBeInTheDocument();
    });

    it('hides weight loss goal for users under 18', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '16' } });

      // "Lose weight" option must not be available for minors
      expect(screen.queryByText(/Lose weight/i)).not.toBeInTheDocument();
    });

    it('disables "Lose weight" option when user is underweight (BMI < 18.5)', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      const ageInput = screen.getByLabelText(/age/i);
      const heightInput = screen.getByLabelText(/height/i);
      const weightInput = screen.getByLabelText(/weight/i);

      fireEvent.change(ageInput, { target: { value: '25' } });
      fireEvent.change(heightInput, { target: { value: '175' } });
      fireEvent.change(weightInput, { target: { value: '45' } }); // BMI ~ 14.7

      const loseBtn = screen.getByRole('radio', { name: /Lose weight/i });
      expect(loseBtn).toHaveAttribute('aria-disabled', 'true');
      expect(
        screen.getByText(/For underweight users, please choose Maintain or Gain weight/i)
      ).toBeInTheDocument();
    });

    it('validates age bounds with inline error', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Profile />
          </AnalysisProvider>
        </HashRouter>
      );

      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '11' } });
      fireEvent.blur(ageInput);

      expect(screen.getByText(/Age must be between 13 and 100 years/i)).toBeInTheDocument();
    });
  });

  describe('Meals Page', () => {
    it('renders all 4 meal sections and progress stepper', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Meals />
          </AnalysisProvider>
        </HashRouter>
      );

      expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Meals Intake/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Fill sample day/i })).toBeInTheDocument();
    });

    it('loads sample persona day and updates totals', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Meals />
          </AnalysisProvider>
        </HashRouter>
      );

      const fillBtn = screen.getByRole('button', { name: /Fill sample day/i });
      fireEvent.click(fillBtn);

      // Priya has tea_with_milk, poha, rice, dal, samosa etc.
      // Total meal count should now be > 0 and clear button should appear
      expect(screen.getByRole('button', { name: /Clear all/i })).toBeInTheDocument();
    });

    it('blocks navigation when total logged items < 2', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Meals />
          </AnalysisProvider>
        </HashRouter>
      );

      // "Analyze My Diet" button should be disabled when empty
      const analyzeBtns = screen.getAllByRole('button', { name: /Analyze/i });
      const mainAnalyzeBtn = analyzeBtns[0];
      expect(mainAnalyzeBtn).toBeDisabled();
    });
  });

  describe('Results Page Guard', () => {
    it('redirects to Profile if state.profile is null', () => {
      render(
        <HashRouter>
          <AnalysisProvider>
            <Results />
          </AnalysisProvider>
        </HashRouter>
      );

      expect(screen.getByText(/Redirecting to profile setup/i)).toBeInTheDocument();
    });
  });

  describe('UI Component Tests', () => {
    it('BMICard displays values and opens explanatory popup', () => {
      render(<BMICard bmi={22.5} category="healthy" age={28} />);

      expect(screen.getByText('22.5')).toBeInTheDocument();
      expect(screen.getByText('Healthy weight')).toBeInTheDocument();

      const infoBtn = screen.getByLabelText(/Why Asian Indian cutoffs differ/i);
      fireEvent.click(infoBtn);

      expect(screen.getByText(/Why Asian Indian BMI cutoffs\?/i)).toBeInTheDocument();
    });

    it('CalorieCard displays target and opens info popup', () => {
      render(<CalorieCard target={2150} />);

      expect(screen.getByText(/~2,150/i)).toBeInTheDocument();

      const infoBtn = screen.getByLabelText(/How is this estimated\?/i);
      fireEvent.click(infoBtn);

      expect(screen.getByText(/Mifflin-St Jeor equation/i)).toBeInTheDocument();
    });

    it('SafetyBanner renders different modes correctly', () => {
      const { rerender } = render(
        <SafetyBanner banners={['Adolescent warning']} mode="limited" />
      );
      expect(screen.getByText(/Adolescent warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Adolescent & Health Guidance/i)).toBeInTheDocument();

      rerender(<SafetyBanner banners={['Clinical warning']} mode="blocked" />);
      expect(screen.getByText(/Safety Notice/i)).toBeInTheDocument();
    });
  });

  describe('Food Aliases & Search Matching', () => {
    it('matches aliases correctly for chapati, curd, chaas, etc.', () => {
      const roti = FOODS.find((f) => f.id === 'roti')!;
      expect(matchesFoodQuery(roti, 'chapati')).toBe(true);
      expect(matchesFoodQuery(roti, 'phulka')).toBe(true);
      expect(matchesFoodQuery(roti, 'roti')).toBe(true);

      const curd = FOODS.find((f) => f.id === 'curd')!;
      expect(matchesFoodQuery(curd, 'dahi')).toBe(true);
      expect(matchesFoodQuery(curd, 'curd')).toBe(true);

      const buttermilk = FOODS.find((f) => f.id === 'buttermilk')!;
      expect(matchesFoodQuery(buttermilk, 'chaas')).toBe(true);
      expect(matchesFoodQuery(buttermilk, 'mattha')).toBe(true);

      const dal = FOODS.find((f) => f.id === 'dal')!;
      expect(matchesFoodQuery(dal, 'lentils')).toBe(true);
      expect(matchesFoodQuery(dal, 'dhal')).toBe(true);
    });

    it('has all required aliases in FOOD_ALIASES', () => {
      expect(FOOD_ALIASES.roti).toContain('chapati');
      expect(FOOD_ALIASES.curd).toContain('dahi');
      expect(FOOD_ALIASES.buttermilk).toContain('chaas');
      expect(FOOD_ALIASES.dal).toContain('lentils');
      expect(FOOD_ALIASES.poha).toContain('pohe');
      expect(FOOD_ALIASES.rajma).toContain('kidney beans');
      expect(FOOD_ALIASES.chole).toContain('chickpea');
    });
  });
});
