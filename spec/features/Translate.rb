require 'spec_helper'

feature 'Translation' do

    scenario 'Translation' do
          visit '/'
          click_on 'The plus'
          fill_in 'Title'
          click_on 'Choose your language'
          page.should have_author 'Edgar Allan Poe'
          page.should have_traductor'Martin Dupont'
          fill_in 'blocs'
          click_on 'link'
          page.should have_blocs 'une fois, sur le minuit lugubre ...  Sur maint précieux et curieux volume ...'
          page.should have_button 'cut'
          click_on 'blocs'
          edit 'blocs'
          click_on 'cut'
          page.should have_bloc 'une fois, sur le minuit ...'
          page.should have_bloc 'Sur maint précieux et curieux volume ...'
          page.should have_button 'link'
    end

end
